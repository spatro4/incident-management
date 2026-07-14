import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";
import { getClientCredentialsToken } from "../shared/oauth2.js";

/**
 * iBase-t eQube (digital-thread / cross-system data integration) connector. eQube's role is
 * federating queries across MES (Solumina), PLM, and ERP (SAP) - the exact dataset/query API
 * shape is deployment-specific (eQube-DPM configurations differ per customer), so the two tools
 * below are intentionally generic: one for a common "pull the full record for this serial number"
 * query, one for arbitrary dataset queries. Adjust paths/params to your eQube instance's actual
 * published API.
 */
async function equbeCall(path: string, init?: RequestInit) {
  const baseUrl = process.env.EQUBE_BASE_URL!; // e.g. https://eqube.yourorg.com/api
  const clientId = process.env.EQUBE_CLIENT_ID!;
  const clientSecret = await getSecret({
    envVar: "EQUBE_CLIENT_SECRET",
    vcapPath: "user-provided.eqube.clientSecret",
    awsSecret: { secretName: "mes/eqube", jsonKey: "clientSecret" },
  });

  const token = await getClientCredentialsToken("eqube", {
    tokenUrl: `${baseUrl}/oauth/token`,
    clientId,
    clientSecret,
  });

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`eQube API error (${response.status}): ${await response.text()}`);
  return response.status === 204 ? {} : response.json();
}

export const equbeConnector: Connector = {
  id: "mes-eqube",
  group: "mes",
  register(server: McpServer) {
    server.tool(
      "eqube_get_digital_thread",
      "Fetch the cross-system digital thread (MES + PLM + ERP records) for a serial or part number",
      { identifier: z.string().describe("Serial number or part number to trace across connected systems") },
      async ({ identifier }) => {
        const data = await equbeCall(`/digital-thread/${encodeURIComponent(identifier)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "eqube_query_dataset",
      "Run a filtered query against a named eQube dataset/data model",
      {
        dataset: z.string().describe("Name of the eQube dataset/view to query"),
        filter: z.record(z.any()).optional().describe("Key/value filter parameters"),
      },
      async ({ dataset, filter }) => {
        const query = filter ? `?${new URLSearchParams(filter as Record<string, string>).toString()}` : "";
        const data = await equbeCall(`/datasets/${encodeURIComponent(dataset)}${query}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
