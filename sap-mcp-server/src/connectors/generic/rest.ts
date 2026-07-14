import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

/**
 * Generic bearer-token REST bridge for any internal system not covered by a dedicated connector.
 * ALLOWED_REST_HOSTS restricts which hosts may be called, to avoid turning this into an open proxy.
 */
function assertAllowedHost(url: string) {
  const allowed = (process.env.ALLOWED_REST_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean);
  const host = new URL(url).host;
  if (!allowed.includes(host)) {
    throw new Error(`Host "${host}" is not in ALLOWED_REST_HOSTS`);
  }
}

export const genericRestConnector: Connector = {
  id: "generic-rest",
  group: "generic",
  register(server: McpServer) {
    server.tool(
      "rest_call",
      "Call an allow-listed internal REST API with bearer-token auth",
      {
        url: z.string().url(),
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
        body: z.record(z.any()).optional(),
      },
      async ({ url, method, body }) => {
        assertAllowedHost(url);
        const token = await getSecret({
          envVar: "GENERIC_REST_BEARER_TOKEN",
          vcapPath: "user-provided.generic-rest.bearerToken",
          awsSecret: { secretName: "generic/rest", jsonKey: "bearerToken" },
        });
        const response = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`REST call failed (${response.status}): ${text}`);
        return { content: [{ type: "text", text }] };
      },
    );
  },
};
