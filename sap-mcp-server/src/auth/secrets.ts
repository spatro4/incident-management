/**
 * Secret resolution abstraction. Set CLOUD_PROVIDER=btp|aws|env to pick the backing store.
 * - btp:  reads service-binding credentials injected into VCAP_SERVICES (Cloud Foundry) at the given path.
 * - aws:  reads from AWS Secrets Manager (secret name = key).
 * - env:  reads straight from process.env (local dev only).
 */
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

type Provider = "btp" | "aws" | "env";

const provider = (process.env.CLOUD_PROVIDER as Provider) ?? "env";
const secretsManagerClient = provider === "aws" ? new SecretsManagerClient({}) : undefined;

let vcapServicesCache: Record<string, Array<{ name: string; credentials: Record<string, string> }>> | undefined;

function getVcapServices() {
  if (!vcapServicesCache) {
    vcapServicesCache = JSON.parse(process.env.VCAP_SERVICES ?? "{}");
  }
  return vcapServicesCache!;
}

/** For BTP: pass "user-provided.my-service-instance.clientId" style paths matching your cf create-user-provided-service name. */
function getFromVcap(path: string): string | undefined {
  const [serviceType, instanceName, credentialKey] = path.split(".");
  const services = getVcapServices()[serviceType];
  const instance = services?.find((s) => s.name === instanceName);
  return instance?.credentials?.[credentialKey];
}

const awsSecretCache = new Map<string, string>();

async function getFromAwsSecretsManager(secretName: string, jsonKey: string): Promise<string> {
  const cacheKey = `${secretName}#${jsonKey}`;
  if (awsSecretCache.has(cacheKey)) return awsSecretCache.get(cacheKey)!;

  const result = await secretsManagerClient!.send(new GetSecretValueCommand({ SecretId: secretName }));
  const parsed = JSON.parse(result.SecretString ?? "{}");
  const value = parsed[jsonKey];
  if (value === undefined) throw new Error(`Key "${jsonKey}" not found in secret "${secretName}"`);
  awsSecretCache.set(cacheKey, value);
  return value;
}

/**
 * Resolve a secret value.
 * envVar:   fallback / local-dev env var name, e.g. "SUCCESSFACTORS_CLIENT_SECRET"
 * vcapPath: BTP VCAP_SERVICES path, e.g. "user-provided.successfactors.clientSecret"
 * awsSecret: AWS Secrets Manager secret name + JSON key, e.g. { secretName: "sap/successfactors", jsonKey: "clientSecret" }
 */
export async function getSecret(opts: {
  envVar: string;
  vcapPath?: string;
  awsSecret?: { secretName: string; jsonKey: string };
}): Promise<string> {
  if (provider === "btp" && opts.vcapPath) {
    const value = getFromVcap(opts.vcapPath);
    if (value) return value;
  }
  if (provider === "aws" && opts.awsSecret) {
    return getFromAwsSecretsManager(opts.awsSecret.secretName, opts.awsSecret.jsonKey);
  }
  const value = process.env[opts.envVar];
  if (!value) throw new Error(`Missing secret: set env var ${opts.envVar} (or configure ${provider} binding)`);
  return value;
}
