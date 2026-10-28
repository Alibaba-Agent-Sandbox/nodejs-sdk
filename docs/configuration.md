# Configuration name reference

[中文](configuration.zh-CN.md)

Back to the [README](../README.md).

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
