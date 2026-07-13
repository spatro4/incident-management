import { z } from "zod";
import nodemailer from "nodemailer";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

async function getTransporter() {
  const password = await getSecret({
    envVar: "SMTP_PASSWORD",
    vcapPath: "user-provided.smtp.password",
    awsSecret: { secretName: "collab/smtp", jsonKey: "password" },
  });
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER!, pass: password },
  });
}

export const emailConnector: Connector = {
  id: "collab-email",
  register(server: McpServer) {
    server.tool(
      "email_send",
      "Send an email notification (e.g. an incident summary) via SMTP",
      { to: z.string().describe("Comma-separated recipient addresses"), subject: z.string(), body: z.string() },
      async ({ to, subject, body }) => {
        const transporter = await getTransporter();
        const info = await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text: body });
        return { content: [{ type: "text", text: `Email sent: ${info.messageId}` }] };
      },
    );
  },
};
