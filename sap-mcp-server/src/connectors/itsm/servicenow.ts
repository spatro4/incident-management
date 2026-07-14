import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";
import { getClientCredentialsToken } from "../shared/oauth2.js";

async function snCall(path: string, init?: RequestInit) {
  const instanceUrl = process.env.SERVICENOW_INSTANCE_URL!; // e.g. https://yourinstance.service-now.com
  const clientId = process.env.SERVICENOW_CLIENT_ID!;
  const clientSecret = await getSecret({
    envVar: "SERVICENOW_CLIENT_SECRET",
    vcapPath: "user-provided.servicenow.clientSecret",
    awsSecret: { secretName: "itsm/servicenow", jsonKey: "clientSecret" },
  });

  const token = await getClientCredentialsToken("servicenow", {
    tokenUrl: `${instanceUrl}/oauth_token.do`,
    clientId,
    clientSecret,
  });

  const response = await fetch(`${instanceUrl}/api/now${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`ServiceNow API error (${response.status}): ${await response.text()}`);
  return response.json();
}

export const serviceNowConnector: Connector = {
  id: "itsm-servicenow",
  group: "itsm",
  register(server: McpServer) {
    server.tool(
      "servicenow_create_incident",
      "Create a new incident record in ServiceNow",
      {
        shortDescription: z.string(),
        description: z.string().optional(),
        urgency: z.enum(["1", "2", "3"]).describe("1=High, 2=Medium, 3=Low").optional(),
        callerId: z.string().optional().describe("sys_id of the caller"),
      },
      async ({ shortDescription, description, urgency, callerId }) => {
        const data = await snCall("/table/incident", {
          method: "POST",
          body: JSON.stringify({
            short_description: shortDescription,
            description,
            urgency,
            caller_id: callerId,
          }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "servicenow_get_incident",
      "Fetch a ServiceNow incident by its number (e.g. INC0012345)",
      { number: z.string() },
      async ({ number }) => {
        const data = await snCall(`/table/incident?sysparm_query=number=${encodeURIComponent(number)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "servicenow_update_incident",
      "Update fields on an existing ServiceNow incident by sys_id",
      { sysId: z.string(), fields: z.record(z.any()) },
      async ({ sysId, fields }) => {
        const data = await snCall(`/table/incident/${sysId}`, { method: "PATCH", body: JSON.stringify(fields) });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
