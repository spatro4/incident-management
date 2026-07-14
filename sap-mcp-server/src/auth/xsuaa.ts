/**
 * Validates XSUAA-issued OAuth2 access tokens on incoming HTTP requests.
 *
 * Uses standard JWKS/RS256 verification against XSUAA's public token_keys endpoint - this is
 * plain OAuth2/OIDC resource-server validation, not an SAP-proprietary mechanism, so it works the
 * same way any JWT-issuing IdP would be validated. XSUAA credentials come from the "xsuaa" service
 * binding (VCAP_SERVICES on Cloud Foundry) created via `cf create-service xsuaa application ...`.
 */
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtHeader, type SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

interface XsuaaCredentials {
  url: string; // e.g. https://<subaccount>.authentication.<region>.hana.ondemand.com
  clientid: string;
  xsappname: string;
}

function getXsuaaCredentials(): XsuaaCredentials {
  const vcapServices = JSON.parse(process.env.VCAP_SERVICES ?? "{}") as Record<string, Array<{ credentials: XsuaaCredentials }>>;
  const xsuaa = vcapServices.xsuaa?.[0]?.credentials;
  if (!xsuaa) throw new Error("No xsuaa service binding found in VCAP_SERVICES");
  return xsuaa;
}

let cachedCredentials: XsuaaCredentials | undefined;
function credentials(): XsuaaCredentials {
  if (!cachedCredentials) cachedCredentials = getXsuaaCredentials();
  return cachedCredentials;
}

let cachedJwksClient: jwksClient.JwksClient | undefined;
function getJwksClient(): jwksClient.JwksClient {
  if (!cachedJwksClient) {
    cachedJwksClient = jwksClient({ jwksUri: `${credentials().url}/token_keys` });
  }
  return cachedJwksClient;
}

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  getJwksClient().getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err ?? new Error("signing key not found"));
    callback(null, key.getPublicKey());
  });
}

export interface AuthenticatedRequest extends Request {
  scopes?: string[];
}

/** Set REQUIRE_XSUAA_AUTH=false only for local testing against a real BTP subaccount without a token. */
export function xsuaaAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) {
    res.status(401).json({ error: "missing bearer token" });
    return;
  }

  // No `audience` check here on purpose: valid callers include separate XSUAA service keys
  // (e.g. one per team, see README "Getting tokens to your users") whose tokens are issued to a
  // different OAuth client than this app's own binding, so they won't share an audience claim.
  // Authorization instead comes from the `scope` claim below, which is namespaced per xsappname -
  // a token can only carry "sap-incident-mcp-server.Invoke.X" scopes if XSUAA actually granted them.
  // Confirm this app's real `iss` claim (decode a live token) if verification unexpectedly fails.
  jwt.verify(
    token,
    getSigningKey,
    { algorithms: ["RS256"], issuer: `${credentials().url}/oauth/token` },
    (err, decoded) => {
      if (err || !decoded || typeof decoded === "string") {
        res.status(401).json({ error: "invalid token", detail: err?.message });
        return;
      }
      req.scopes = (decoded.scope as string[] | undefined) ?? [];
      next();
    },
  );
}

/** Maps this deployment's XSUAA scopes (xsappname.Invoke.<Group>) to connector groups the caller may use. */
export function allowedGroupsFromScopes(scopes: string[]): Set<string> {
  const prefix = `${credentials().xsappname}.Invoke.`;
  const groups = scopes.filter((s) => s.startsWith(prefix)).map((s) => s.slice(prefix.length).toLowerCase());
  return new Set(groups);
}
