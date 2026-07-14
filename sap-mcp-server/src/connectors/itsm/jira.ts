import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

async function jiraCall(path: string, init?: RequestInit) {
  const baseUrl = process.env.JIRA_BASE_URL!; // e.g. https://yourorg.atlassian.net
  const email = process.env.JIRA_EMAIL!;
  const apiToken = await getSecret({
    envVar: "JIRA_API_TOKEN",
    vcapPath: "user-provided.jira.apiToken",
    awsSecret: { secretName: "itsm/jira", jsonKey: "apiToken" },
  });

  const response = await fetch(`${baseUrl}/rest/api/3${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Jira API error (${response.status}): ${await response.text()}`);
  return response.status === 204 ? {} : response.json();
}

export const jiraConnector: Connector = {
  id: "itsm-jira",
  group: "itsm",
  register(server: McpServer) {
    server.tool(
      "jira_create_issue",
      "Create a Jira issue (e.g. an incident ticket) in a given project",
      {
        projectKey: z.string(),
        summary: z.string(),
        description: z.string().optional(),
        issueType: z.string().default("Incident"),
      },
      async ({ projectKey, summary, description, issueType }) => {
        const data = await jiraCall("/issue", {
          method: "POST",
          body: JSON.stringify({
            fields: {
              project: { key: projectKey },
              summary,
              description: description
                ? { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: description }] }] }
                : undefined,
              issuetype: { name: issueType },
            },
          }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "jira_get_issue",
      "Fetch a Jira issue by key (e.g. OPS-123)",
      { issueKey: z.string() },
      async ({ issueKey }) => {
        const data = await jiraCall(`/issue/${issueKey}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );

    server.tool(
      "jira_add_comment",
      "Add a comment to an existing Jira issue",
      { issueKey: z.string(), comment: z.string() },
      async ({ issueKey, comment }) => {
        const data = await jiraCall(`/issue/${issueKey}/comment`, {
          method: "POST",
          body: JSON.stringify({ body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: comment }] }] } }),
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      },
    );
  },
};
