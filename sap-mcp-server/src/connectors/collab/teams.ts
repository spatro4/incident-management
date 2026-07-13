import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";

/** Uses a Teams Incoming Webhook (or Power Automate workflow) URL per channel - simplest option, no Graph app registration needed. */
export const teamsConnector: Connector = {
  id: "collab-teams",
  register(server: McpServer) {
    server.tool(
      "teams_post_message",
      "Post a message to a Microsoft Teams channel via its Incoming Webhook URL",
      {
        webhookUrl: z.string().url().describe("Teams channel webhook URL (or set TEAMS_DEFAULT_WEBHOOK_URL env var and omit)"),
        text: z.string(),
      },
      async ({ webhookUrl, text }) => {
        const url = webhookUrl || process.env.TEAMS_DEFAULT_WEBHOOK_URL!;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error(`Teams webhook error (${response.status}): ${await response.text()}`);
        return { content: [{ type: "text", text: "Message posted to Teams." }] };
      },
    );
  },
};
