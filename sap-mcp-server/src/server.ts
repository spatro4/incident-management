import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAllConnectors } from "./registry.js";
import { xsuaaAuthMiddleware, allowedGroupsFromScopes, type AuthenticatedRequest } from "./auth/xsuaa.js";

function buildServer(allowedGroups?: Set<string>): McpServer {
  const server = new McpServer({ name: "sap-incident-mcp-server", version: "0.1.0" });
  registerAllConnectors(server, allowedGroups);
  return server;
}

async function main() {
  const transportMode = process.env.MCP_TRANSPORT ?? "stdio"; // "stdio" for local dev/CLI, "http" for cloud deployment

  if (transportMode === "stdio") {
    const server = buildServer();
    await server.connect(new StdioServerTransport());
    console.error("[sap-mcp-server] listening on stdio");
    return;
  }

  const app = express();
  app.use(express.json());

  // Must be registered before the auth middleware below - Cloud Foundry's own health-checker
  // (health-check-http-endpoint in manifest.yml) probes this with no credentials at all.
  app.get("/healthz", (_req, res) => res.status(200).send("ok"));

  // On BTP: every caller presents their own XSUAA-issued token (from SSO via the corporate IdP),
  // and gets only the connector groups their role collection grants (see xs-security.json).
  // Off BTP (e.g. AWS): fall back to a single shared bearer token for the whole deployment - fine
  // for a service-to-service integration, but it does NOT give per-user access control.
  const useXsuaa = process.env.CLOUD_PROVIDER === "btp";
  const requiredToken = process.env.MCP_BEARER_TOKEN;

  app.use((req: AuthenticatedRequest, res, next) => {
    if (useXsuaa) return xsuaaAuthMiddleware(req, res, next);
    if (!requiredToken) return next(); // no auth configured - fine for local testing, never in production
    const header = req.header("authorization");
    if (header !== `Bearer ${requiredToken}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  app.post("/mcp", async (req: AuthenticatedRequest, res) => {
    const allowedGroups = useXsuaa && req.scopes ? allowedGroupsFromScopes(req.scopes) : undefined;
    const server = buildServer(allowedGroups);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => console.error(`[sap-mcp-server] listening on :${port} (HTTP transport)`));
}

main().catch((err) => {
  console.error("[sap-mcp-server] fatal error:", err);
  process.exit(1);
});
