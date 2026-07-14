import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";
import { getClientCredentialsToken } from "../shared/oauth2.js";

async function sfCall(path: string, init?: RequestInit) {
  const baseUrl = process.env.SUCCESSFACTORS_BASE_URL!; // e.g. https://api<dc>.successfactors.com/odata/v2
  const clientId = process.env.SUCCESSFACTORS_CLIENT_ID!;
  const clientSecret = await getSecret({
    envVar: "SUCCESSFACTORS_CLIENT_SECRET",
    vcapPath: "user-provided.successfactors.clientSecret",
    awsSecret: { secretName: "sap/successfactors", jsonKey: "clientSecret" },
  });

  const token = await getClientCredentialsToken("successfactors", {
    tokenUrl: `${baseUrl}/../oauth/token`,
    clientId,
    clientSecret,
  });

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`SuccessFactors API error (${response.status}): ${await response.text()}`);
  return response.json();
}

export const successFactorsConnector: Connector = {
  id: "sap-successfactors",
  group: "sap",
  register(server: McpServer) {
    server.tool(
      "sap_successfactors_get_employee",
      "Fetch an employee master-data record from SAP SuccessFactors Employee Central by personIdExternal",
      { personIdExternal: z.string().describe("SuccessFactors personIdExternal, e.g. employee ID") },
      async ({ personIdExternal }) => {
        const data = await sfCall(`/PerPerson('${encodeURIComponent(personIdExternal)}')?$format=json`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "sap_successfactors_search_employees",
      "Search SuccessFactors employees by a $filter OData expression",
      { filter: z.string().describe("OData $filter expression, e.g. \"department eq 'IT'\"") },
      async ({ filter }) => {
        const data = await sfCall(`/PerPerson?$filter=${encodeURIComponent(filter)}&$format=json`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
