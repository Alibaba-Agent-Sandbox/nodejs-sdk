# @agent-sandbox/sdk

**English** | [中文](README.zh-CN.md)

Node.js client for [Agent Sandbox](https://github.com/alibaba-agent-sandbox/python-sdk). Node.js 20 or newer. ESM only.

This package is the **first slice** of the Node.js SDK. It contains:

- the **configuration-name table** (one environment variable per key)
- `ServerClient`, an **in-sandbox HTTP client** for `agent-sandbox-server` (`agent_sandbox.server`)

It is **not** a port of `Sandbox.create`, cloud providers, or the server SDK. Creating a cloud sandbox still belongs to the Python SDK and the `abx` CLI.

## Install

On 2026-10-18 the public npm metadata endpoint for `@agent-sandbox/sdk` returned 404.
Build the source package until the matching release is available on your registry:

```bash
git clone https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk.git
cd nodejs-sdk
npm ci
npm run build
npm pack
```

This checkout's version 0.1.0 produces `agent-sandbox-sdk-0.1.0.tgz` with built
`dist/` exports. In your application, install that generated archive:

```bash
npm install /absolute/path/to/agent-sandbox-sdk-0.1.0.tgz
```

When the release exists on your configured registry, `npm install @agent-sandbox/sdk`
uses the same import surface. No publication is implied by this source recipe.
For local development, `npm test` builds and runs `node:test`; the real local
example needs the Python server installed as described in [examples](examples/README.md).

## ServerClient

`ServerClient` speaks HTTP to a server started with `python3 -m agent_sandbox.server serve` (default port 9000). These four calls are the ones the local agent loop uses. They are enabled by default:

| Method | Request |
| --- | --- |
| `health()` | `GET /health` |
| `process.shell(command)` | `POST /shell` with JSON `{ "command": "..." }` |
| `files.upload(path, data)` | `POST /files/upload-stream` with JSON `{ "path", "content_base64" }` |
| `files.download(path)` / `files.readText(path)` | `GET /files/download-stream?path=` |

`cwd`, `env`, and `timeout` are added to the shell body only when you set them. The server tokenises `command`; it does not run a shell. A bearer token, when passed to the constructor, is sent as `Authorization: Bearer` (the same secret as `ABX_SERVER_TOKEN`).

Opt-in capability groups (`dev_tools`, `browser`, `agents`) stay off unless `ABX_SERVER_ENABLED_GROUPS` lists them. That variable is the only group switch. Agents routes answer with `X-Agent-Sandbox-*` headers (for example `X-Agent-Sandbox-Local`). This client does not call those routes.

```js
import { ServerClient } from "@agent-sandbox/sdk";

const server = new ServerClient("http://127.0.0.1:9000");
if (await server.health()) {
  const ran = await server.process.shell("python3 -c 'print(2 + 2)'");
  console.log(ran.stdout); // "4\n"
}
await server.close();
```

`examples/agent-loop.mjs` starts that local server and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`. The recorded run is in [examples/README.md](examples/README.md).

## Gateway and application authentication

For a provider port gateway, pass the exact sandbox/port URL including its proxy
prefix and query. The client preserves existing query bytes and appends operation
parameters without replacing gateway parameters. All redirects are rejected,
including redirects to another sandbox on the same origin. URL userinfo and
request paths that escape the bound prefix are rejected. Raw or recursively
encoded control characters, path separators and dot traversal are validated
before URL normalization. Duplicate or recursively equivalent gateway query
keys cannot be introduced by the base URL or an operation.

Use `token` for the application service token and `gatewayHeaders` for the
provider gateway's headers. `headers` contains other application headers. Header
names must not overlap between groups; an existing `Authorization` header cannot
be combined with `token`. Authority and transport headers cannot be overridden.
The public `baseUrl` and connection errors omit query credentials. Never pass a
provider control-plane API key as the application token. This client accepts
prefix-bound HTTP URLs; operation-specific signed path bindings must use the provider
adapter's operation transport. This prefix client does not accept those bindings.

The explicit application `token` is also sent as `X-Access-Token` when no supplied header already occupies that name, case-insensitively. Bearer is retained for existing services. Caller and gateway headers are copied for each request and never overwritten; requests without a token gain no application credentials. This supports server proxies that strip Authorization using the server's existing authentication header.

## Configuration names

The table exports configuration names. `readEnv` only reads a value; it does not apply these fields to `ServerClient`. Retired retry settings are not exported.

`src/config-keys.json` is the canonical list, exported from `python -m agent_sandbox.utils.config_keys --json`. Each key has exactly one environment variable. There are no aliases. `readEnv` reads only that name.

`configSchema.reserved_provider_ids` follows the
[Python registry](https://github.com/Alibaba-Agent-Sandbox/python-sdk/blob/145341d462df2f4753c03a62365114f1872acd1a/client-sdk/src/agent_sandbox/utils/config_keys.py):
built-in/core identifiers stay reserved, while the installable catalog id `e2b`
is available. Provider execution belongs to the Python SDK and `abx`.

Product keys use the `ABX_` prefix: `ABX_SANDBOX_API_KEY`, `ABX_SANDBOX_BASE_URL`, `ABX_SANDBOX_DOMAIN`, `ABX_PROVIDER`.

Where the vendor already publishes a name, that name is the environment variable: `ALICLOUD_ACCESS_KEY_ID`, `ALICLOUD_ACCESS_KEY_SECRET`, `ALIBABA_CLOUD_REGION_ID`, and `GITHUB_TOKEN`.

```js
import { envName, readEnv } from "@agent-sandbox/sdk";

envName("sandbox_api_key"); // ABX_SANDBOX_API_KEY
envName("access_key_id", "alicloud-express"); // ALICLOUD_ACCESS_KEY_ID
readEnv("sandbox_api_key", process.env);
```

| Key | Scope | Environment variable | Description |
| --- | --- | --- | --- |
| `provider` | core | `ABX_PROVIDER` | Default provider id (see 'abx provider list') |
| `sandbox_api_key` | core | `ABX_SANDBOX_API_KEY` | Agent Sandbox API key of the active provider |
| `sandbox_base_url` | core | `ABX_SANDBOX_BASE_URL` | Agent Sandbox API endpoint of the active provider |
| `sandbox_domain` | core | `ABX_SANDBOX_DOMAIN` | Envd data-plane domain |
| `http_timeout` | core | `ABX_HTTP_TIMEOUT` | HTTP request timeout in seconds |
| `http2` | core | `ABX_HTTP2` | Use HTTP/2 |
| `max_connections` | core | `ABX_MAX_CONNECTIONS` | |
| `max_keepalive_connections` | core | `ABX_MAX_KEEPALIVE_CONNECTIONS` | |
| `keepalive_expiry` | core | `ABX_KEEPALIVE_EXPIRY` | |
| `ws_ping_interval` | core | `ABX_WS_PING_INTERVAL` | |
| `log_level` | core | `ABX_LOG_LEVEL` | Log level |
| `default_template` | core | `ABX_DEFAULT_TEMPLATE` | Template used when none is given |
| `github_token` | core | `GITHUB_TOKEN` | GitHub token for the template index |
| `template_index_url` | core | `ABX_TEMPLATE_INDEX_URL` | |
| `template_dir` | core | `ABX_TEMPLATE_DIR` | |
| `mcp_auth_token` | core | `ABX_MCP_AUTH_TOKEN` | |
| `mcp_allowed_origins` | core | `ABX_MCP_ALLOWED_ORIGINS` | |
| `mcp_runtime_dir` | core | `ABX_MCP_RUNTIME_DIR` | |
| `region` | alicloud-express | `ALIBABA_CLOUD_REGION_ID` | Region id (derives the API URL and domain) |
| `access_key_id` | alicloud-express | `ALICLOUD_ACCESS_KEY_ID` | Alibaba Cloud AccessKey ID |
| `access_key_secret` | alicloud-express | `ALICLOUD_ACCESS_KEY_SECRET` | Alibaba Cloud AccessKey secret |

## What this package does not do

- `Sandbox.create`, templates, or any cloud control plane
- provider drivers (including Alibaba Cloud Express beyond the env-name table)
- the in-sandbox server itself (`agent-sandbox-server` remains Python)
- PTY, browser, devtools, or the rest of the Python `ServerClient` surface

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
