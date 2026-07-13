import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "./types.js";
import { successFactorsConnector } from "./connectors/sap/successfactors.js";
import { aribaConnector } from "./connectors/sap/ariba.js";
import { s4hanaRfcConnector } from "./connectors/sap/s4hana-rfc.js";
import { serviceNowConnector } from "./connectors/itsm/servicenow.js";
import { jiraConnector } from "./connectors/itsm/jira.js";
import { pagerDutyConnector } from "./connectors/itsm/pagerduty.js";
import { slackConnector } from "./connectors/collab/slack.js";
import { teamsConnector } from "./connectors/collab/teams.js";
import { emailConnector } from "./connectors/collab/email.js";
import { databaseConnector } from "./connectors/generic/database.js";
import { genericRestConnector } from "./connectors/generic/rest.js";

const allConnectors: Connector[] = [
  successFactorsConnector,
  aribaConnector,
  s4hanaRfcConnector,
  serviceNowConnector,
  jiraConnector,
  pagerDutyConnector,
  slackConnector,
  teamsConnector,
  emailConnector,
  databaseConnector,
  genericRestConnector,
];

/** ENABLED_CONNECTORS restricts which connectors load, e.g. "sap-successfactors,itsm-servicenow,collab-slack". Unset = all. */
export function registerAllConnectors(server: McpServer): void {
  const enabled = process.env.ENABLED_CONNECTORS?.split(",").map((s) => s.trim());
  for (const connector of allConnectors) {
    if (enabled && !enabled.includes(connector.id)) continue;
    connector.register(server);
    console.error(`[sap-mcp-server] registered connector: ${connector.id}`);
  }
}
