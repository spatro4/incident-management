import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";
import { getClientCredentialsToken } from "../shared/oauth2.js";

async function aribaCall(path: string) {
  const baseUrl = process.env.ARIBA_BASE_URL!; // e.g. https://openapi.ariba.com/api/analytics-reporting-view/v1/prod
  const apiKey = process.env.ARIBA_API_KEY!; // Ariba requires an APIKey header in addition to OAuth
  const clientId = process.env.ARIBA_CLIENT_ID!;
  const clientSecret = await getSecret({
    envVar: "ARIBA_CLIENT_SECRET",
    vcapPath: "user-provided.ariba.clientSecret",
    awsSecret: { secretName: "sap/ariba", jsonKey: "clientSecret" },
  });

  const token = await getClientCredentialsToken("ariba", {
    tokenUrl: "https://api.ariba.com/v2/oauth/token",
    clientId,
    clientSecret,
  });

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}`, apiKey, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Ariba API error (${response.status}): ${await response.text()}`);
  return response.json();
}

export const aribaConnector: Connector = {
  id: "sap-ariba",
  register(server: McpServer) {
    server.tool(
      "sap_ariba_get_purchase_order",
      "Fetch a purchase order from SAP Ariba by PO number",
      { poNumber: z.string() },
      async ({ poNumber }) => {
        const data = await aribaCall(`/purchaseOrders/${encodeURIComponent(poNumber)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
