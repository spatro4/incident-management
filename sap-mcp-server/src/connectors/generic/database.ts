import { z } from "zod";
import { Pool } from "pg";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

let pool: Pool | undefined;

async function getPool() {
  if (!pool) {
    const password = await getSecret({
      envVar: "GENERIC_DB_PASSWORD",
      vcapPath: "user-provided.generic-db.password",
      awsSecret: { secretName: "generic/database", jsonKey: "password" },
    });
    pool = new Pool({
      host: process.env.GENERIC_DB_HOST,
      port: Number(process.env.GENERIC_DB_PORT ?? 5432),
      database: process.env.GENERIC_DB_NAME,
      user: process.env.GENERIC_DB_USER,
      password,
      ssl: process.env.GENERIC_DB_SSL === "true",
    });
  }
  return pool;
}

/** Read-only guard: swap for a role-based allowlist if write access is ever needed. */
function assertReadOnly(sql: string) {
  if (!/^\s*select\b/i.test(sql)) {
    throw new Error("Only SELECT statements are permitted through this tool.");
  }
}

export const databaseConnector: Connector = {
  id: "generic-database",
  group: "generic",
  register(server: McpServer) {
    server.tool(
      "database_query",
      "Run a read-only SQL query against the configured Postgres database and return rows",
      { sql: z.string(), params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional() },
      async ({ sql, params }) => {
        assertReadOnly(sql);
        const client = await getPool();
        const result = await client.query(sql, params ?? []);
        return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
      },
    );
  },
};
