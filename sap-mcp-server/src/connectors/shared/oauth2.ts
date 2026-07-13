/** Shared OAuth2 client-credentials token cache, reused by every REST/OData-based connector. */

interface TokenCacheEntry {
  accessToken: string;
  expiresAt: number;
}

const cache = new Map<string, TokenCacheEntry>();

export interface ClientCredentialsConfig {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

export async function getClientCredentialsToken(cacheKey: string, config: ClientCredentialsConfig): Promise<string> {
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.accessToken;
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  if (config.scope) body.set("scope", config.scope);

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`OAuth2 token request failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cache.set(cacheKey, { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}
