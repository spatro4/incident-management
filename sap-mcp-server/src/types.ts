import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/** Access-control group. Matches the Invoke.<Group> scopes in deploy/btp/xs-security.json,
 * so org admins can grant e.g. only "sap" access to the SAP Basis team via a role collection. */
export type ConnectorGroup = "sap" | "mes" | "itsm" | "collab" | "generic";

/** Every connector module exports one of these; registry.ts wires them all into the server. */
export interface Connector {
  id: string;
  group: ConnectorGroup;
  register(server: McpServer): void;
}
