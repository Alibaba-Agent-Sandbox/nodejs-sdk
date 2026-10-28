# 配置名参考

[English](configuration.md)

返回 [README](../README.zh-CN.md)。

## 配置名

此表导出配置名称；`readEnv` 只读取值，不会把这些字段自动应用到 `ServerClient`。已移除不生效的旧重试配置名称。

`src/config-keys.json` 是规范列表，来自 `python -m agent_sandbox.utils.config_keys --json`。每个 key 只有一个环境变量，没有别名。`readEnv` 只读这个名字。

`configSchema.reserved_provider_ids` 遵循
[Python 注册表](https://github.com/Alibaba-Agent-Sandbox/python-sdk/blob/145341d462df2f4753c03a62365114f1872acd1a/client-sdk/src/agent_sandbox/utils/config_keys.py)：
内置及核心标识仍保留，可安装的目录提供方标识 `e2b` 不再保留。
提供方执行由 Python SDK 和 `abx` 负责。

产品 key 使用 `ABX_` 前缀：`ABX_SANDBOX_API_KEY`、`ABX_SANDBOX_BASE_URL`、`ABX_SANDBOX_DOMAIN`、`ABX_PROVIDER`。

厂商已经公布名字时，环境变量就用那个名字：`ALICLOUD_ACCESS_KEY_ID`、`ALICLOUD_ACCESS_KEY_SECRET`、`ALIBABA_CLOUD_REGION_ID`，以及 `GITHUB_TOKEN`。

```js
import { envName, readEnv } from "@agent-sandbox/sdk";

envName("sandbox_api_key"); // ABX_SANDBOX_API_KEY
envName("access_key_id", "alicloud-express"); // ALICLOUD_ACCESS_KEY_ID
readEnv("sandbox_api_key", process.env);
```

| Key | 范围 | 环境变量 | 说明 |
| --- | --- | --- | --- |
| `provider` | core | `ABX_PROVIDER` | 默认 provider 标识（见 'abx provider list'） |
| `sandbox_api_key` | core | `ABX_SANDBOX_API_KEY` | 当前 provider 的 Agent Sandbox API Key |
| `sandbox_base_url` | core | `ABX_SANDBOX_BASE_URL` | 当前 provider 的 Agent Sandbox API 端点 |
| `sandbox_domain` | core | `ABX_SANDBOX_DOMAIN` | envd 数据面域名 |
| `http_timeout` | core | `ABX_HTTP_TIMEOUT` | HTTP 请求超时（秒） |
| `http2` | core | `ABX_HTTP2` | 启用 HTTP/2 |
| `max_connections` | core | `ABX_MAX_CONNECTIONS` | |
| `max_keepalive_connections` | core | `ABX_MAX_KEEPALIVE_CONNECTIONS` | |
| `keepalive_expiry` | core | `ABX_KEEPALIVE_EXPIRY` | |
| `ws_ping_interval` | core | `ABX_WS_PING_INTERVAL` | |
| `log_level` | core | `ABX_LOG_LEVEL` | 日志级别 |
| `default_template` | core | `ABX_DEFAULT_TEMPLATE` | 未指定模板时使用的模板 |
| `github_token` | core | `GITHUB_TOKEN` | 用于模板索引的 GitHub Token |
| `template_index_url` | core | `ABX_TEMPLATE_INDEX_URL` | |
| `template_dir` | core | `ABX_TEMPLATE_DIR` | |
| `mcp_auth_token` | core | `ABX_MCP_AUTH_TOKEN` | |
| `mcp_allowed_origins` | core | `ABX_MCP_ALLOWED_ORIGINS` | |
| `mcp_runtime_dir` | core | `ABX_MCP_RUNTIME_DIR` | |
| `region` | alicloud-express | `ALIBABA_CLOUD_REGION_ID` | 地域（用于推导 API 地址和域名） |
| `access_key_id` | alicloud-express | `ALICLOUD_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `access_key_secret` | alicloud-express | `ALICLOUD_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |
