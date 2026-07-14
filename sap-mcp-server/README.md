# SAP Incident-Management MCP Server

An MCP server that gives Claude Code (and any other MCP client) tools to read/write across:

- **SAP**: S/4HANA on-premise (RFC/BAPI, via Cloud Connector), SuccessFactors, Ariba
- **ITSM**: ServiceNow, Jira, PagerDuty
- **Collaboration**: Slack, Microsoft Teams, email
- **Generic**: any Postgres-compatible DB, any allow-listed internal REST API

Each system is a self-contained "connector" module under `src/connectors/`. Adding a new
system means adding one file and registering it in `src/registry.ts` — nothing else changes.

```
src/
  server.ts            entrypoint: stdio transport (local) or Streamable HTTP (cloud)
  registry.ts           wires every connector's tools into the McpServer
  auth/secrets.ts       resolves secrets from BTP VCAP_SERVICES, AWS Secrets Manager, or env vars
  connectors/
    sap/                successfactors.ts, ariba.ts, s4hana-rfc.ts
    itsm/               servicenow.ts, jira.ts, pagerduty.ts
    collab/             slack.ts, teams.ts, email.ts
    generic/            database.ts, rest.ts
    shared/oauth2.ts    shared client-credentials token cache
deploy/
  btp/                  manifest.yml (Cloud Foundry), xs-security.json (XSUAA scopes)
  aws/                  Dockerfile, ecs-task-definition.json
```

---

## 1. BTP vs AWS: which one should host this?

| | **SAP BTP** | **AWS** |
|---|---|---|
| Reaching on-prem S/4HANA/ECC (RFC/BAPI) | **Native.** Cloud Connector + Connectivity service tunnel in with no VPN/firewall changes; Destination service centralizes connection config and supports principal propagation. | **Hard.** You need Direct Connect/VPN into the corporate network, or you re-expose SAP through an API gateway first. Running `node-rfc` also needs the proprietary SAP NW RFC SDK baked into your container, which is untested on Fargate. |
| Reaching SuccessFactors/Ariba (OData/REST) | Easy — same as anywhere, it's just HTTPS + OAuth2. | Equally easy — same as anywhere. |
| Non-SAP systems (Slack, ServiceNow, generic DBs) | Works fine, but you're paying BTP compute prices and you're outside your org's AWS-native tooling (Bedrock, CloudWatch, IAM, existing VPC peering). | **Native.** If your ITSM/Slack/DB infra already lives in AWS or peers with AWS, this is the natural home. |
| Auth model | XSUAA (OAuth2, SAP-managed roles/scopes), integrates with SAP IAS for SSO. | IAM + Secrets Manager + your own bearer-token/OAuth layer (e.g. Cognito) in front of the server. |
| Ops familiarity | Requires CF/Kyma know-how; smaller ecosystem, SAP-specific tooling. | If your team already runs ECS/EKS/Lambda, this is zero new tooling. |
| Cost | BTP compute + service instance costs (Connectivity/Destination are usually included in most BTP contracts). | Standard Fargate/ALB pricing; usually cheaper at scale. |

### Recommendation: hybrid, not either/or

Split the architecture at the natural boundary — **the SAP on-prem connection is the one thing
BTP does that AWS genuinely can't do well**:

```
                 ┌─────────────────────────────┐
 Claude Code  →  │   MCP Server (this repo)     │  ← deploy wherever your other
 (enterprise)    │   ITSM / Slack / Teams /     │    infra lives — AWS ECS/Fargate
                 │   email / generic DB & REST  │    is fine and often cheapest
                 └───────────────┬─────────────┘
                                 │ HTTPS + OAuth2 (SuccessFactors/Ariba directly;
                                 │ RFC/BAPI calls proxied)
                 ┌───────────────▼─────────────┐
                 │ Same MCP server codebase,    │  ← a second small deployment of
                 │ deployed on BTP Cloud        │    THIS SAME repo, with only
                 │ Foundry, ENABLED_CONNECTORS  │    ENABLED_CONNECTORS=sap-s4hana-rfc
                 │ =sap-s4hana-rfc              │
                 └───────────────┬─────────────┘
                                 │ Cloud Connector tunnel
                                 ▼
                        On-prem S/4HANA / ECC
```

In practice: run the full server on BTP if you're comfortable there and want one deployment —
it covers every connector in this repo including RFC. Only split to AWS-plus-BTP if your org's
ITSM/Slack/DB integrations are AWS-native and you want that traffic to stay on AWS. The
`ENABLED_CONNECTORS` env var (see `.env.example`) is what makes running two scoped instances of
the same codebase practical — no code fork needed.

If you don't have any on-prem RFC/BAPI requirement (e.g. you only ever need SuccessFactors/Ariba
OData), skip all of this and just run the whole thing on AWS — it's simpler and cheaper.

---

## 2. Local development

```bash
cd sap-mcp-server
npm install
cp .env.example .env   # fill in the systems you're testing against
npm run dev            # MCP_TRANSPORT=stdio by default — talks over stdin/stdout
```

Point a local MCP client (Claude Code, Claude Desktop, the MCP Inspector) at it:

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

---

## 3. Deploying on SAP BTP (Cloud Foundry)

1. **Prerequisites**: a BTP subaccount with Cloud Foundry enabled, `cf` CLI installed and logged
   in (`cf login`, `cf target -o <org> -s <space>`).

2. **Prefer OData over raw RFC where you can.** `node-rfc` (the native binding used by
   `sap-s4hana-rfc`) is in maintenance-only mode per its own npm listing. If the BAPI you need is
   already exposed as an SAP Gateway/Integration Suite OData service, write a connector like
   `successfactors.ts` instead — it's plain HTTPS+OAuth2, no native SDK, and works identically on
   BTP or AWS. Reach for `sap-s4hana-rfc` only when no OData facade exists.

3. **Install SAP Cloud Connector** (only needed if you're using `sap-s4hana-rfc`): download from
   the SAP Software Center, install it on a host with network access to your on-prem SAP system,
   and pair it to your BTP subaccount (Connectivity → Cloud Connectors → add subaccount).
   In the Cloud Connector UI, add your on-prem SAP system as an "ABAP System" resource and expose
   it under a **virtual host** (e.g. `s4-onprem-vh:3300`) — this virtual host is what
   `SAP_RFC_ASHOST` in `.env` points to, never the real internal hostname.

4. **Create the required service instances**:
   ```bash
   cf create-service xsuaa application sap-incident-mcp-xsuaa -c deploy/btp/xs-security.json
   cf create-service destination lite sap-incident-mcp-destination
   cf create-service connectivity lite sap-incident-mcp-connectivity
   ```

5. **Create a Destination** (BTP cockpit → Connectivity → Destinations) of type `RFC` pointing at
   the Cloud Connector virtual host, with `Proxy Type: OnPremise`. For SuccessFactors/Ariba, plain
   OAuth2ClientCredentials destinations are enough (or just use the env vars directly — the
   Destination service is optional for pure-cloud APIs).

6. **Store non-SAP secrets as user-provided services** — one per system, matching the
   `vcapPath` used in each connector (see `src/auth/secrets.ts`):
   ```bash
   cf create-user-provided-service successfactors -p '{"clientSecret":"..."}'
   cf create-user-provided-service servicenow -p '{"clientSecret":"..."}'
   cf create-user-provided-service slack -p '{"botToken":"xoxb-..."}'
   # repeat for jira, pagerduty, smtp, generic-db, generic-rest, sap-rfc as needed
   ```
   Add each service name to the `services:` list in `deploy/btp/manifest.yml`.

7. **Push**:
   ```bash
   cf push -f deploy/btp/manifest.yml
   ```

8. **Auth for callers**: bind an XSUAA-issued OAuth2 token to every request (`Authorization:
   Bearer <token>`), obtained via client-credentials grant against your XSUAA service key. Claude
   Code will send whatever bearer token you configure in its MCP server settings (see §6).

---

## 4. Deploying for your entire organization on Cloud Foundry

Section 3 gets one instance running. Rolling it out org-wide means: it survives an instance
crash, more than one team can use it without everyone sharing a single all-powerful secret, and
someone other than you can keep it running. Here's what changes.

### 4.1 Org/space layout

Don't drop this into a personal dev space. Pick (or create) a space your platform/ops team
actually owns, e.g. `cf create-space mcp-prod -o <your-org>`, and grant `SpaceDeveloper` to the
people who'll operate it (`cf set-space-role <user> <org> mcp-prod SpaceDeveloper`). Confirm your
subaccount has enough Cloud Foundry quota (memory/routes) entitled for 2+ instances — check under
BTP cockpit → Entitlements.

### 4.2 High availability

Already reflected in `deploy/btp/manifest.yml`: `instances: 2`, plus
`health-check-type: http` / `health-check-http-endpoint: /healthz` so Cloud Foundry restarts an
instance that stops responding instead of leaving it half-dead. Cloud Foundry's Gorouter
automatically load-balances across all instances of the app — no separate load balancer to set
up. Bump `instances:` further if usage grows; each is independent and stateless (a fresh
`McpServer` is built per HTTP request, see `src/server.ts`), so scaling out is just changing that
number and re-pushing.

### 4.3 Access control per team (not one shared secret for everyone)

A single static bearer token for the whole org means anyone who has it can call every connector,
and you can't tell which team member did what. `src/auth/xsuaa.ts` and the updated
`deploy/btp/xs-security.json` replace that with real per-caller scopes:

- `xs-security.json` now defines scopes `Invoke.Sap`, `Invoke.Itsm`, `Invoke.Collab`,
  `Invoke.Generic`, and role templates `SapTeam` (SAP tools only), `OpsTeam` (ITSM + collab only),
  and `AllTeams` (everything).
- In BTP cockpit → Security → **Role Collections**, create one Role Collection per group (e.g.
  "MCP - SAP Basis", "MCP - Incident Response") and add the matching role template to each.
- Under Security → **Trust Configuration**, map your corporate IdP's groups (synced via SAP Cloud
  Identity Services / SCIM, or your existing SAML/OIDC group claim) to those Role Collections, so
  whoever your IT already puts in "SAP-Basis-Team" in Active Directory automatically gets the
  right MCP scopes — no manual per-user provisioning.
- At request time, `xsuaaAuthMiddleware` (in `src/auth/xsuaa.ts`) verifies the caller's JWT against
  XSUAA's public keys and reads their granted scopes; `allowedGroupsFromScopes` turns those into
  the set of connector groups `registerAllConnectors` will actually register for that request. A
  caller with only `OpsTeam` scopes literally never sees the `sap_call_bapi` tool exist.

### 4.4 Getting tokens to your users

This is the part every org has to decide for itself, so pick based on how much setup you want now:

- **Per-team tokens (simplest, works today):** create one XSUAA service key per team —
  `cf create-service-key sap-incident-mcp-xsuaa sap-team-key`, then attach the `SapTeam` role
  collection to that key's technical client. `cf service-key sap-incident-mcp-xsuaa sap-team-key`
  gives you a `clientid`/`clientsecret` that team can exchange for a bearer token
  (`grant_type=client_credentials` against `<xsuaa-url>/oauth/token`) and put in their Claude Code
  MCP config. Everyone on that team shares one token, scoped to only what their team is allowed —
  a big step up from one org-wide secret, with no extra infrastructure.
- **Per-individual SSO login (stronger, more setup):** XSUAA also supports the `authorization_code`
  grant (enabled in `xs-security.json`), so each employee can get their own personal token via a
  one-time browser login through your corporate IdP. Whether this can be fully automatic depends
  on whether your Claude Code enterprise build supports the MCP remote-server OAuth flow (check
  with your Claude Code admin/current docs) — if not, the usual pattern is a small internal
  "approuter" page employees visit once to complete the login and copy their token into
  `.mcp.json`. This gives per-user audit trails at the cost of standing up that login page.

Start with per-team tokens; move to per-individual SSO later if audit/compliance needs it.

### 4.5 Monitoring

Bind the **Application Logging Service** (`cf create-service application-logs lite
sap-incident-mcp-logging`, already referenced in `manifest.yml`) to get centralized logs across
all instances — `console.error` calls in this codebase (connector registration, fatal errors) flow
straight into it. For alerting on the app being down, use BTP's Alert Notification service or
point an external uptime check at `/healthz`.

### 4.6 Keeping it updated without someone SSHing in

`.github/workflows/sap-mcp-server-deploy.yml` runs `cf push --strategy rolling` automatically on
every merge to `main` that touches `sap-mcp-server/`, using CF credentials stored as GitHub Actions
secrets (`CF_API`, `CF_ORG`, `CF_SPACE`, `CF_USERNAME`, `CF_PASSWORD`). Rolling deploy replaces
instances one at a time so the org-wide URL stays up during a release. Point those secrets at a
dedicated CI/CD service account, not a personal login.

---

## 5. Deploying on AWS (ECS Fargate)

1. **Prerequisites**: an AWS account, `aws` CLI configured, an ECR repository, a VPC with at
   least one private subnet + NAT (or a public subnet if you're fine with a public ALB).

2. **Build and push the image**:
   ```bash
   aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
   docker build -f deploy/aws/Dockerfile -t sap-incident-mcp-server .
   docker tag sap-incident-mcp-server:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sap-incident-mcp-server:latest
   docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sap-incident-mcp-server:latest
   ```

3. **Store secrets in AWS Secrets Manager** — one secret per system, JSON-shaped to match the
   `awsSecret` keys used in each connector, e.g.:
   ```bash
   aws secretsmanager create-secret --name sap/successfactors --secret-string '{"clientSecret":"..."}'
   aws secretsmanager create-secret --name itsm/servicenow --secret-string '{"clientSecret":"..."}'
   aws secretsmanager create-secret --name mcp/bearer-token --secret-string '{"token":"..."}'
   ```
   Grant `secretsmanager:GetSecretValue` to the ECS task role (`taskRoleArn` in the task
   definition) scoped to just these ARNs.

4. **Register the task definition and create the service**:
   ```bash
   aws ecs register-task-definition --cli-input-json file://deploy/aws/ecs-task-definition.json
   aws ecs create-service --cluster <cluster> --service-name sap-incident-mcp-server \
     --task-definition sap-incident-mcp-server --desired-count 1 --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[<subnet-ids>],securityGroups=[<sg-id>],assignPublicIp=DISABLED}" \
     --load-balancers targetGroupArn=<tg-arn>,containerName=sap-incident-mcp-server,containerPort=8080
   ```

5. **Front it with an ALB** and terminate TLS there. Set `MCP_BEARER_TOKEN` (via the Secrets
   Manager entry above) so the server rejects unauthenticated requests — see the auth middleware
   in `src/server.ts`.

6. **Reaching on-prem SAP from AWS** (only if you're not using the BTP-split approach in §1):
   set up AWS Direct Connect or a site-to-site VPN into the network segment where your SAP
   Gateway/Cloud Connector-equivalent lives, and treat it as any other private-network call. This
   is meaningfully more setup than the BTP path — budget for it accordingly.

---

## 6. Connecting Claude Code (enterprise) to this server

Claude Code enterprise admins typically manage which MCP servers are allowed via a
managed `settings.json` policy (`mcpServers` allow/deny list) pushed to all users — check with
your Claude Code admin whether this server needs to be added to that org-wide allowlist before
individual users can enable it.

**Local/stdio (dev machines, direct process spawn):**
```bash
claude mcp add sap-incident-mcp -- node /path/to/sap-mcp-server/dist/server.js
```

**Remote/HTTP (the BTP or AWS deployment from §3/§4):**
```bash
claude mcp add --transport http sap-incident-mcp https://<your-deployed-host>/mcp \
  --header "Authorization: Bearer <MCP_BEARER_TOKEN>"
```
Or in a project's `.mcp.json`:
```json
{
  "mcpServers": {
    "sap-incident-mcp": {
      "type": "http",
      "url": "https://<your-deployed-host>/mcp",
      "headers": { "Authorization": "Bearer <MCP_BEARER_TOKEN>" }
    }
  }
}
```

Once connected, tools like `sap_successfactors_get_employee`, `servicenow_create_incident`,
`slack_post_message`, etc. become available to Claude in that session.

---

## 7. Setting up each non-SAP system

- **Slack**: create an app at api.slack.com/apps, add the `chat:write` bot scope, install to your
  workspace, copy the Bot User OAuth Token into `SLACK_BOT_TOKEN`.
- **Microsoft Teams**: in the target channel, add an "Incoming Webhook" connector and copy the
  URL into `TEAMS_DEFAULT_WEBHOOK_URL` (or pass per-call).
- **ServiceNow**: create an OAuth API endpoint (System OAuth → Application Registry) with the
  client-credentials grant enabled, copy client ID/secret.
- **Jira**: create an API token at id.atlassian.com/manage-profile/security/api-tokens, pair it
  with the account email for Basic auth.
- **PagerDuty**: create a Events API v2 integration on the target service for the routing key
  (used per-call), and/or a personal/API-only REST API key for `pagerduty_list_incidents`.
- **Generic DB/REST**: point at a read replica for the DB connector (it enforces `SELECT`-only);
  set `ALLOWED_REST_HOSTS` explicitly — the generic REST tool refuses to call any host not on
  that list.

---

## 8. Security notes

- Every connector reads secrets through `src/auth/secrets.ts`, never hardcoded — extend that
  file if you add a secret backend beyond BTP/AWS/env.
- `ENABLED_CONNECTORS` lets you run scoped deployments (e.g. an RFC-only instance on BTP) so a
  compromised bearer token doesn't expose every system at once.
- The generic DB and REST connectors are deliberately restrictive (read-only SQL, host
  allow-list) — tighten further before giving broad token access to end users.
- Put real auth in front of the HTTP transport in production (`MCP_BEARER_TOKEN` at minimum;
  XSUAA-issued tokens on BTP or an ALB + Cognito/IAM authorizer on AWS are stronger options).
