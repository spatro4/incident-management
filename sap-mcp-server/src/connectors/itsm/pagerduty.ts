import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

async function pagerDutyApiKey() {
  return getSecret({
    envVar: "PAGERDUTY_API_KEY",
    vcapPath: "user-provided.pagerduty.apiKey",
    awsSecret: { secretName: "itsm/pagerduty", jsonKey: "apiKey" },
  });
}

export const pagerDutyConnector: Connector = {
  id: "itsm-pagerduty",
  register(server: McpServer) {
    server.tool(
      "pagerduty_trigger_incident",
      "Trigger a new PagerDuty incident/alert via the Events API v2",
      {
        routingKey: z.string().describe("Integration key for the target PagerDuty service"),
        summary: z.string(),
        source: z.string().describe("Originating system, e.g. 'sap-s4hana-prod'"),
        severity: z.enum(["critical", "error", "warning", "info"]).default("error"),
      },
      async ({ routingKey, summary, source, severity }) => {
        const response = await fetch("https://events.pagerduty.com/v2/enqueue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            routing_key: routingKey,
            event_action: "trigger",
            payload: { summary, source, severity },
          }),
        });
        if (!response.ok) throw new Error(`PagerDuty Events API error (${response.status}): ${await response.text()}`);
        return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
      },
    );

    server.tool(
      "pagerduty_list_incidents",
      "List current PagerDuty incidents, optionally filtered by status",
      { statuses: z.array(z.enum(["triggered", "acknowledged", "resolved"])).optional() },
      async ({ statuses }) => {
        const apiKey = await pagerDutyApiKey();
        const query = statuses?.length ? `?${statuses.map((s) => `statuses[]=${s}`).join("&")}` : "";
        const response = await fetch(`https://api.pagerduty.com/incidents${query}`, {
          headers: { Authorization: `Token token=${apiKey}`, Accept: "application/vnd.pagerduty+json;version=2" },
        });
        if (!response.ok) throw new Error(`PagerDuty API error (${response.status}): ${await response.text()}`);
        return { content: [{ type: "text", text: JSON.stringify(await response.json(), null, 2) }] };
      },
    );
  },
};
