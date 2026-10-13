import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Canonical configuration keys.
 *
 * `config-keys.json` is the schema export of
 * `agent_sandbox.utils.config_keys` (`python -m agent_sandbox.utils.config_keys --json`).
 * Each key has exactly one environment variable (`env` / `env_names[0]`).
 * Aliases are empty. `readEnv` consults only that name.
 */

export interface ConfigStorage {
  file: string;
  name: string;
  section?: string;
}

export interface ConfigKey {
  key: string;
  scope: string;
  type: string;
  secret: boolean;
  credential: boolean;
  settable: boolean;
  env: string;
  aliases: readonly unknown[];
  env_names: readonly string[];
  toml_section: string | null;
  storage_phase1: ConfigStorage | null;
  storage_phase2: ConfigStorage | null;
  default: unknown;
  choices: readonly string[];
  group: string;
  description: string;
}

export interface ConfigSchema {
  schema_version: number;
  builtin_provider: { id: string; name: string; name_zh: string };
  reserved_provider_ids: readonly string[];
  reserved_provider_prefixes: readonly string[];
  generic_endpoint_keys: readonly string[];
  tuning_keys: readonly string[];
  keys: readonly ConfigKey[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadSchema(): ConfigSchema {
  const file = fileURLToPath(new URL("./config-keys.json", import.meta.url));
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!isRecord(parsed) || !Array.isArray(parsed.keys)) {
    throw new Error("config-keys.json is missing a keys array");
  }
  const seenEnv = new Set<string>();
  const seenId = new Set<string>();
  for (const raw of parsed.keys) {
    if (!isRecord(raw) || typeof raw.key !== "string" || typeof raw.scope !== "string") {
      throw new Error("config-keys.json has a key entry without key/scope");
    }
    const id = `${raw.scope}.${raw.key}`;
    if (seenId.has(id)) {
      throw new Error(`duplicate config key ${id}`);
    }
    seenId.add(id);
    const names = raw.env_names;
    if (!Array.isArray(names) || names.length !== 1 || names[0] !== raw.env) {
      throw new Error(`${id} must expose exactly one env name`);
    }
    if (typeof raw.env !== "string" || raw.env.length === 0) {
      throw new Error(`${id} is missing env`);
    }
    if (!Array.isArray(raw.aliases) || raw.aliases.length !== 0) {
      throw new Error(`${id} must not declare aliases`);
    }
    if (seenEnv.has(raw.env)) {
      throw new Error(`${id} env ${raw.env} is duplicated`);
    }
    seenEnv.add(raw.env);
  }
  return parsed as unknown as ConfigSchema;
}

export const configSchema: ConfigSchema = loadSchema();

/** Every canonical key, in fixture order. One environment name each. */
export const CONFIG_KEYS: readonly ConfigKey[] = Object.freeze(
  configSchema.keys.map((key) => Object.freeze({ ...key, env_names: Object.freeze([...key.env_names]) })),
);

const BY_ID = new Map<string, ConfigKey>(CONFIG_KEYS.map((key) => [`${key.scope}.${key.key}`, key]));

/** The single official environment variable for a key. */
export function envName(key: string, scope = "core"): string {
  const found = BY_ID.get(`${scope}.${key}`);
  if (!found) {
    throw new Error(`Unknown config key ${scope}.${key}`);
  }
  return found.env;
}

/** Whether `name` is the official environment variable of some key. */
export function acceptsEnvName(name: string): boolean {
  return CONFIG_KEYS.some((key) => key.env === name);
}

/**
 * Read one key from an environment map. Only the canonical name is consulted.
 * A blank or whitespace-only value is unset.
 */
export function readEnv(
  key: string,
  environ: Readonly<Record<string, string | undefined>>,
  scope = "core",
): string | undefined {
  const name = envName(key, scope);
  const raw = environ[name];
  if (raw === undefined) return undefined;
  if (raw.trim() === "") return undefined;
  return raw;
}
