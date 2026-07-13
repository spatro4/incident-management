import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAllConnectors } from "./registry.js";

function buildServer(): McpServer {
  const server = new McpServer({ name: "sap-incident-mcp-server", version: "0.1.0" });
  registerAllConnectors(server);
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

  const requiredToken = process.env.MCP_BEARER_TOKEN;
  app.use((req, res, next) => {
    if (!requiredToken) return next(); // no auth configured - fine for local testing, never in production
    const header = req.header("authorization");
    if (header !== `Bearer ${requiredToken}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  app.get("/healthz", (_req, res) => res.status(200).send("ok"));

  app.post("/mcp", async (req, res) => {
    const server = buildServer();
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
