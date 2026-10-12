import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CONFIG_KEYS,
  RETIRED_ENV_NAMES,
  acceptsEnvName,
  configSchema,
  envName,
  readEnv,
} from "../dist/index.js";

const source = JSON.parse(
  readFileSync(new URL("../src/config-keys.json", import.meta.url), "utf8"),
);

test("fixture is copied through with one env name per key", () => {
  assert.equal(configSchema.schema_version, 1);
  assert.equal(CONFIG_KEYS.length, source.keys.length);
  assert.equal(CONFIG_KEYS.length, 36);
  for (const [index, key] of CONFIG_KEYS.entries()) {
    const raw = source.keys[index];
    assert.equal(key.key, raw.key);
    assert.equal(key.scope, raw.scope);
    assert.deepEqual(key.aliases, []);
    assert.deepEqual([...key.env_names], [key.env]);
    assert.equal(key.env, raw.env);
    assert.equal(envName(key.key, key.scope), key.env);
  }
  const names = CONFIG_KEYS.map((key) => key.env);
  assert.equal(new Set(names).size, names.length);
});

test("official vendor names are the env vars", () => {
  assert.equal(envName("provider"), "EBX_PROVIDER");
  assert.equal(envName("sandbox_api_key"), "EBX_SANDBOX_API_KEY");
  assert.equal(envName("sandbox_base_url"), "EBX_SANDBOX_BASE_URL");
  assert.equal(envName("sandbox_domain"), "EBX_SANDBOX_DOMAIN");
  assert.equal(envName("llm_api_key"), "EBX_LLM_API_KEY");
  assert.equal(envName("github_token"), "GITHUB_TOKEN");
  assert.equal(envName("region", "alicloud-express"), "ALIBABA_CLOUD_REGION_ID");
  assert.equal(envName("access_key_id", "alicloud-express"), "ALICLOUD_ACCESS_KEY_ID");
  assert.equal(envName("access_key_secret", "alicloud-express"), "ALICLOUD_ACCESS_KEY_SECRET");
  assert.equal(envName("acr_namespace", "alicloud-express"), "ACR_NAMESPACE");
  assert.equal(envName("acr_registry", "alicloud-express"), "ACR_REGISTRY");
  assert.equal(envName("acr_repo", "alicloud-express"), "ACR_REPO");
  assert.equal(envName("acr_username", "alicloud-express"), "ACR_USERNAME");
  assert.equal(envName("acr_password", "alicloud-express"), "ACR_PASSWORD");
  assert.equal(envName("acr_instance_id", "alicloud-express"), "ACREE_INSTANCE_ID");
  assert.equal(envName("acr_vpc_id", "alicloud-express"), "ACR_VPC_ID");
  assert.equal(envName("acr_vswitch_ids", "alicloud-express"), "ACR_VSWITCH_IDS");
  assert.equal(envName("acr_security_group_id", "alicloud-express"), "ACR_SECURITY_GROUP_ID");
  assert.equal(envName("team_id", "alicloud-express"), "EBX_ALICLOUD_EXPRESS_TEAM_ID");
});

test("retired names are not accepted", () => {
  const known = new Set(CONFIG_KEYS.map((key) => key.env));
  for (const name of [
    "E2B_API_KEY",
    "SANDBOX_API_KEY",
    "AccessKey",
    "EBX_ALICLOUD_EXPRESS_ACCESS_KEY_ID",
    ...RETIRED_ENV_NAMES,
  ]) {
    assert.equal(known.has(name), false, name);
    assert.equal(acceptsEnvName(name), false, name);
  }
  assert.equal(acceptsEnvName("EBX_SANDBOX_API_KEY"), true);
  assert.equal(acceptsEnvName("ALICLOUD_ACCESS_KEY_ID"), true);
  assert.equal(acceptsEnvName("EBX_ALICLOUD_EXPRESS_TEAM_ID"), true);
});

test("readEnv consults only the canonical name", () => {
  assert.equal(
    readEnv("sandbox_api_key", {
      E2B_API_KEY: "compat",
      SANDBOX_API_KEY: "legacy",
      EBX_SANDBOX_API_KEY: "canon",
    }),
    "canon",
  );
  assert.equal(
    readEnv("sandbox_api_key", {
      E2B_API_KEY: "compat",
      SANDBOX_API_KEY: "legacy",
    }),
    undefined,
  );
  assert.equal(
    readEnv("sandbox_api_key", { EBX_SANDBOX_API_KEY: "   " }),
    undefined,
  );
  assert.equal(
    readEnv(
      "access_key_id",
      {
        AccessKey: "no",
        EBX_ALICLOUD_EXPRESS_ACCESS_KEY_ID: "no",
        ALICLOUD_ACCESS_KEY_ID: "id",
      },
      "alicloud-express",
    ),
    "id",
  );
  assert.equal(
    readEnv(
      "access_key_id",
      { AccessKey: "no", EBX_ALICLOUD_EXPRESS_ACCESS_KEY_ID: "no" },
      "alicloud-express",
    ),
    undefined,
  );
});
