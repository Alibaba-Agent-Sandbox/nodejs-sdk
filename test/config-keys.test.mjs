import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  CONFIG_KEYS,
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
  assert.equal(CONFIG_KEYS.length, 23);
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
  assert.deepEqual(configSchema.reserved_provider_prefixes, ["abx-", "alicloud-", "shortcuts"]);
});

test("official names are the env vars", () => {
  assert.equal(envName("provider"), "ABX_PROVIDER");
  assert.equal(envName("sandbox_api_key"), "ABX_SANDBOX_API_KEY");
  assert.equal(envName("sandbox_base_url"), "ABX_SANDBOX_BASE_URL");
  assert.equal(envName("sandbox_domain"), "ABX_SANDBOX_DOMAIN");
  assert.equal(envName("github_token"), "GITHUB_TOKEN");
  assert.equal(envName("region", "alicloud-express"), "ALIBABA_CLOUD_REGION_ID");
  assert.equal(envName("access_key_id", "alicloud-express"), "ALICLOUD_ACCESS_KEY_ID");
  assert.equal(envName("access_key_secret", "alicloud-express"), "ALICLOUD_ACCESS_KEY_SECRET");
});

test("only canonical env names are accepted", () => {
  const known = new Set(CONFIG_KEYS.map((key) => key.env));
  assert.equal(acceptsEnvName("ABX_SANDBOX_API_KEY"), true);
  assert.equal(acceptsEnvName("ALICLOUD_ACCESS_KEY_ID"), true);
  assert.equal(acceptsEnvName("GITHUB_TOKEN"), true);
  assert.equal(acceptsEnvName("NOT_A_CONFIG_KEY"), false);
  assert.equal(known.has("NOT_A_CONFIG_KEY"), false);
});

test("readEnv consults only the canonical name", () => {
  assert.equal(
    readEnv("sandbox_api_key", {
      NOT_A_CONFIG_KEY: "other",
      ABX_SANDBOX_API_KEY: "canon",
    }),
    "canon",
  );
  assert.equal(readEnv("sandbox_api_key", { NOT_A_CONFIG_KEY: "other" }), undefined);
  assert.equal(readEnv("sandbox_api_key", { ABX_SANDBOX_API_KEY: "   " }), undefined);
  assert.equal(
    readEnv(
      "access_key_id",
      { NOT_A_CONFIG_KEY: "no", ALICLOUD_ACCESS_KEY_ID: "id" },
      "alicloud-express",
    ),
    "id",
  );
  assert.equal(
    readEnv("access_key_id", { NOT_A_CONFIG_KEY: "no" }, "alicloud-express"),
    undefined,
  );
});
