import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";
import { getClientCredentialsToken } from "../shared/oauth2.js";

/**
 * iBase-t Solumina (MES) connector. Solumina's web-service surface (SOAP "Solumina Web Services"
 * vs a newer REST API) varies by version/customer configuration - the paths and payload shapes
 * below are a reasonable starting shape for a REST+OAuth2 deployment. Confirm against your
 * instance's actual API/WSDL before relying on this in production.
 */
async function soluminaCall(path: string, init?: RequestInit) {
  const baseUrl = process.env.SOLUMINA_BASE_URL!; // e.g. https://solumina.yourorg.com/api/v1
  const clientId = process.env.SOLUMINA_CLIENT_ID!;
  const clientSecret = await getSecret({
    envVar: "SOLUMINA_CLIENT_SECRET",
    vcapPath: "user-provided.solumina.clientSecret",
    awsSecret: { secretName: "mes/solumina", jsonKey: "clientSecret" },
  });

  const token = await getClientCredentialsToken("solumina", {
    tokenUrl: `${baseUrl}/oauth/token`,
    clientId,
    clientSecret,
  });

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Solumina API error (${response.status}): ${await response.text()}`);
  return response.status === 204 ? {} : response.json();
}

export const soluminaConnector: Connector = {
  id: "mes-solumina",
  group: "mes",
  register(server: McpServer) {
    server.tool(
      "solumina_get_work_order",
      "Fetch a Solumina work order's status, routing step, and shop-floor location",
      { workOrderNumber: z.string() },
      async ({ workOrderNumber }) => {
        const data = await soluminaCall(`/workorders/${encodeURIComponent(workOrderNumber)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "solumina_get_nonconformance",
      "Fetch a Solumina nonconformance record (NCR) by number",
      { ncrNumber: z.string() },
      async ({ ncrNumber }) => {
        const data = await soluminaCall(`/nonconformances/${encodeURIComponent(ncrNumber)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "solumina_create_nonconformance",
      "Open a new nonconformance record in Solumina against a work order/part",
      {
        workOrderNumber: z.string(),
        partNumber: z.string(),
        description: z.string(),
        severity: z.enum(["minor", "major", "critical"]).default("minor"),
      },
      async ({ workOrderNumber, partNumber, description, severity }) => {
        const data = await soluminaCall("/nonconformances", {
          method: "POST",
          body: JSON.stringify({ workOrderNumber, partNumber, description, severity }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
