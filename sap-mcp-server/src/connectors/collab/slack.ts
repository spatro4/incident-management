import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

async function slackBotToken() {
  return getSecret({
    envVar: "SLACK_BOT_TOKEN",
    vcapPath: "user-provided.slack.botToken",
    awsSecret: { secretName: "collab/slack", jsonKey: "botToken" },
  });
}

export const slackConnector: Connector = {
  id: "collab-slack",
  group: "collab",
  register(server: McpServer) {
    server.tool(
      "slack_post_message",
      "Post a message to a Slack channel",
      { channel: z.string().describe("Channel ID or name, e.g. #incidents"), text: z.string() },
      async ({ channel, text }) => {
        const token = await slackBotToken();
        const response = await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ channel, text }),
        });
        const data = await response.json();
        if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
