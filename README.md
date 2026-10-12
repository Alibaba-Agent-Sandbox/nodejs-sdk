# @easy-sandbox/sdk

**English** | [中文](README.zh-CN.md)

Node.js client for [Easy Sandbox](https://github.com/Easy-Sandbox/python-sdk). Node.js 20 or newer. ESM only.

This package is the **first slice** of the Node.js SDK. It contains:

- the **configuration-name table** (one environment variable per key)
- `ServerClient`, an **in-sandbox HTTP client** for `easy-sandbox-server`

It is **not** a port of `Sandbox.create`, cloud providers, or the server SDK. Claude, Cursor, and Qoder adapters are not included. Creating a cloud sandbox still belongs to the Python SDK.

## Install

```bash
npm install @easy-sandbox/sdk
```

The published entry is `dist/`. From a checkout:

```bash
npm install
npm test
node examples/agent-loop.mjs
```

`npm test` builds first, then runs `node:test`.

## ServerClient

`ServerClient` speaks HTTP to a server started with `python3 -m easy_sandbox.server serve` (default port 9000). These four calls are the ones the local agent loop uses:

| Method | Request |
| --- | --- |
| `health()` | `GET /health` |
| `process.shell(command)` | `POST /shell` with JSON `{ "command": "..." }` |
| `files.upload(path, data)` | `POST /files/upload-stream` with JSON `{ "path", "content_base64" }` |
| `files.download(path)` / `files.readText(path)` | `GET /files/download-stream?path=` |

`cwd`, `env`, and `timeout` are added to the shell body only when you set them. The server tokenises `command`; it does not run a shell. A bearer token, when passed to the constructor, is sent as `Authorization: Bearer`.

```js
import { ServerClient } from "@easy-sandbox/sdk";

const server = new ServerClient("http://127.0.0.1:9000");
if (await server.health()) {
  const ran = await server.process.shell("python3 -c 'print(2 + 2)'");
  console.log(ran.stdout); // "4\n"
}
await server.close();
```

`examples/agent-loop.mjs` starts that local server and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`. The recorded run is in [examples/README.md](examples/README.md).

## Configuration names

`src/config-keys.json` is the canonical list, copied from the Python client's `client-sdk/tests/fixtures/config-keys.json`. Each key has exactly one environment variable. There are no aliases.

Product keys use the `EBX_` prefix: `EBX_SANDBOX_API_KEY`, `EBX_SANDBOX_BASE_URL`, `EBX_SANDBOX_DOMAIN`, `EBX_LLM_API_KEY`, `EBX_PROVIDER`.

Where the vendor already publishes a name, that name is the environment variable: `ALICLOUD_ACCESS_KEY_ID`, `ALICLOUD_ACCESS_KEY_SECRET`, `ALIBABA_CLOUD_REGION_ID`, the `ACR_*` / `ACREE_INSTANCE_ID` names below, and `GITHUB_TOKEN`.

These names are **not** accepted: `E2B_API_KEY`, `SANDBOX_API_KEY`, `AccessKey`, `EBX_ALICLOUD_EXPRESS_ACCESS_KEY_ID`. `readEnv` reads only the canonical name, so a retired name set beside it does not count. `EBX_ALICLOUD_EXPRESS_TEAM_ID` is a different key (`team_id`); it stays because the vendor has no separate name for it.

```js
import { envName, readEnv } from "@easy-sandbox/sdk";

envName("sandbox_api_key"); // EBX_SANDBOX_API_KEY
envName("access_key_id", "alicloud-express"); // ALICLOUD_ACCESS_KEY_ID
readEnv("sandbox_api_key", process.env);
```

| Key | Scope | Environment variable | Description |
| --- | --- | --- | --- |
| `provider` | core | `EBX_PROVIDER` | Default provider id |
| `sandbox_api_key` | core | `EBX_SANDBOX_API_KEY` | Sandbox API key (any E2B-protocol endpoint) |
| `sandbox_base_url` | core | `EBX_SANDBOX_BASE_URL` | Platform API URL, any E2B-protocol endpoint |
| `sandbox_domain` | core | `EBX_SANDBOX_DOMAIN` | Envd data-plane domain |
| `http_timeout` | core | `EBX_HTTP_TIMEOUT` | HTTP request timeout in seconds |
| `http2` | core | `EBX_HTTP2` | Use HTTP/2 |
| `max_retries` | core | `EBX_MAX_RETRIES` | Maximum automatic retries |
| `max_connections` | core | `EBX_MAX_CONNECTIONS` | |
| `max_keepalive_connections` | core | `EBX_MAX_KEEPALIVE_CONNECTIONS` | |
| `keepalive_expiry` | core | `EBX_KEEPALIVE_EXPIRY` | |
| `ws_ping_interval` | core | `EBX_WS_PING_INTERVAL` | |
| `retry_base_delay` | core | `EBX_RETRY_BASE_DELAY` | |
| `log_level` | core | `EBX_LOG_LEVEL` | Log level |
| `default_template` | core | `EBX_DEFAULT_TEMPLATE` | Template used when none is given |
| `llm_api_key` | core | `EBX_LLM_API_KEY` | LLM API key for AI codegen |
| `llm_base_url` | core | `EBX_LLM_BASE_URL` | LLM endpoint (OpenAI-compatible) |
| `llm_model` | core | `EBX_LLM_MODEL` | LLM model name |
| `github_token` | core | `GITHUB_TOKEN` | GitHub token for the template index |
| `template_index_url` | core | `EBX_TEMPLATE_INDEX_URL` | |
| `template_dir` | core | `EBX_TEMPLATE_DIR` | |
| `mcp_auth_token` | core | `EBX_MCP_AUTH_TOKEN` | |
| `mcp_allowed_origins` | core | `EBX_MCP_ALLOWED_ORIGINS` | |
| `mcp_runtime_dir` | core | `EBX_MCP_RUNTIME_DIR` | |
| `region` | alicloud-express | `ALIBABA_CLOUD_REGION_ID` | Region id (derives the API URL and domain) |
| `access_key_id` | alicloud-express | `ALICLOUD_ACCESS_KEY_ID` | Alibaba Cloud AccessKey ID |
| `access_key_secret` | alicloud-express | `ALICLOUD_ACCESS_KEY_SECRET` | Alibaba Cloud AccessKey secret |
| `acr_namespace` | alicloud-express | `ACR_NAMESPACE` | ACR namespace |
| `acr_registry` | alicloud-express | `ACR_REGISTRY` | ACR registry host |
| `acr_repo` | alicloud-express | `ACR_REPO` | ACR repository |
| `acr_username` | alicloud-express | `ACR_USERNAME` | ACR username |
| `acr_password` | alicloud-express | `ACR_PASSWORD` | ACR password |
| `acr_instance_id` | alicloud-express | `ACREE_INSTANCE_ID` | ACR Enterprise instance id |
| `acr_vpc_id` | alicloud-express | `ACR_VPC_ID` | ACR VPC id |
| `acr_vswitch_ids` | alicloud-express | `ACR_VSWITCH_IDS` | ACR vSwitch ids (comma-separated) |
| `acr_security_group_id` | alicloud-express | `ACR_SECURITY_GROUP_ID` | ACR security group id |
| `team_id` | alicloud-express | `EBX_ALICLOUD_EXPRESS_TEAM_ID` | Team id |

## What this package does not do

- `Sandbox.create`, templates, or any cloud control plane
- provider drivers (including Alibaba Cloud Express beyond the env-name table)
- the in-sandbox server itself (`easy-sandbox-server` remains Python)
- PTY, browser, devtools, or the rest of the Python `ServerClient` surface
- Claude, Cursor, or Qoder adapters

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
