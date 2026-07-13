import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** Every connector module exports one of these; registry.ts wires them all into the server. */
export interface Connector {
  id: string;
  register(server: McpServer): void;
}
