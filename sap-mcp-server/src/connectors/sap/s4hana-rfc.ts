import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connector } from "../../types.js";
import { getSecret } from "../../auth/secrets.js";

/**
 * On-premise S/4HANA (or ECC) access via classic RFC/BAPI, reached through SAP Cloud Connector.
 * Requires:
 *   1. The proprietary SAP NW RFC SDK installed on the host (not npm-installable) - see README.
 *   2. `npm install node-rfc` (declared as optionalDependency so builds without it still succeed).
 *   3. A Cloud Connector configured with a virtual host that maps to the on-prem SAP application
 *      server, and (on BTP) a Destination of type RFC referencing that virtual host + Connectivity service.
 *
 * node-rfc is in maintenance-only mode (see its npm deprecation notice) - if your BAPIs can be
 * exposed as an OData service (SAP Gateway or Integration Suite), prefer that route and use the
 * successfactors.ts/ariba.ts pattern instead. Keep this connector for BAPIs with no OData facade.
 */

/** Minimal shape we rely on from node-rfc. Kept local (rather than `import type` from the
 * package) so `tsc` doesn't require node-rfc's types to be installed for the rest of the
 * server to build - it's an optionalDependency precisely because it needs the native SDK. */
interface RfcClient {
  open(): Promise<void>;
  close(): Promise<void>;
  call(functionModule: string, parameters: Record<string, unknown>): Promise<unknown>;
}
interface RfcModule {
  Client: new (connectionParams: Record<string, unknown>) => RfcClient;
}

let rfcModule: RfcModule | undefined;
async function loadRfcModule(): Promise<RfcModule> {
  if (!rfcModule) {
    const moduleName = "node-rfc"; // non-literal specifier so tsc doesn't try to resolve its types
    rfcModule = (await import(moduleName)) as RfcModule;
  }
  return rfcModule;
}

async function getRfcConnectionParams() {
  const password = await getSecret({
    envVar: "SAP_RFC_PASSWORD",
    vcapPath: "user-provided.sap-rfc.password",
    awsSecret: { secretName: "sap/rfc", jsonKey: "password" },
  });

  return {
    ashost: process.env.SAP_RFC_ASHOST!, // virtual host exposed by Cloud Connector, e.g. "s4-onprem-vh"
    sysnr: process.env.SAP_RFC_SYSNR ?? "00",
    client: process.env.SAP_RFC_CLIENT!, // SAP client/mandant, e.g. "100"
    user: process.env.SAP_RFC_USER!,
    passwd: password,
    lang: process.env.SAP_RFC_LANG ?? "EN",
    // On BTP Cloud Foundry, route through the Connectivity Proxy instead of connecting directly:
    ...(process.env.CLOUD_PROVIDER === "btp"
      ? {
          proxy_host: process.env.CC_HOST,
          proxy_port: process.env.CC_PORT,
          // The Connectivity service issues a JWT that must accompany the connection; see README "BTP RFC auth" section.
        }
      : {}),
  };
}

export const s4hanaRfcConnector: Connector = {
  id: "sap-s4hana-rfc",
  register(server: McpServer) {
    server.tool(
      "sap_call_bapi",
      "Invoke an arbitrary RFC-enabled function module or BAPI on the on-prem SAP system (e.g. BAPI_INCIDENT_CREATE, BAPI_ALM_NOTIF_GET_LIST)",
      {
        functionModule: z.string().describe("Name of the RFC-enabled function module/BAPI"),
        parameters: z.record(z.any()).describe("Import parameters/tables as a JSON object matching the BAPI signature"),
      },
      async ({ functionModule, parameters }) => {
        const { Client } = await loadRfcModule();
        const client = new Client(await getRfcConnectionParams());
        try {
          await client.open();
          const result = await client.call(functionModule, parameters);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } finally {
          await client.close();
        }
      },
    );

    server.tool(
      "sap_get_notification",
      "Fetch a PM/QM notification (commonly used to represent plant/equipment incidents) via BAPI_ALM_NOTIF_GET_LIST",
      { notificationNumber: z.string() },
      async ({ notificationNumber }) => {
        const { Client } = await loadRfcModule();
        const client = new Client(await getRfcConnectionParams());
        try {
          await client.open();
          const result = await client.call("BAPI_ALM_NOTIF_GET_LIST", {
            NOTIFICATION: [{ NOTIF_NO: notificationNumber }],
          });
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } finally {
          await client.close();
        }
      },
    );
  },
};
