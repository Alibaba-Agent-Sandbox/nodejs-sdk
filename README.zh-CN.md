# @easy-sandbox/sdk

[English](README.md) | **中文**

[Easy Sandbox](https://github.com/Easy-Sandbox/python-sdk) 的 Node.js 客户端。需要 Node.js 20 或更高版本，仅提供 ESM。

这个包是 Node.js SDK 的**第一段**，目前只有两样东西：

- **配置名表**（每个 key 只有一个环境变量）
- `ServerClient`：面向 `easy-sandbox-server` 的**沙箱内 HTTP 客户端**

它**还不是** `Sandbox.create`、云厂商 provider 或服务端 SDK 的移植。不包含 Claude、Cursor、Qoder 适配器。创建云沙箱仍然使用 Python SDK。

## 安装

```bash
npm install @easy-sandbox/sdk
```

发布入口是 `dist/`。从仓库检出后：

```bash
npm install
npm test
node examples/agent-loop.mjs
```

`npm test` 会先构建，再用 `node:test` 跑测试。

## ServerClient

`ServerClient` 通过 HTTP 访问 `python3 -m easy_sandbox.server serve` 启动的进程（默认端口 9000）。本地 agent 循环用到的是这四个调用：

| 方法 | 请求 |
| --- | --- |
| `health()` | `GET /health` |
| `process.shell(command)` | `POST /shell`，JSON `{ "command": "..." }` |
| `files.upload(path, data)` | `POST /files/upload-stream`，JSON `{ "path", "content_base64" }` |
| `files.download(path)` / `files.readText(path)` | `GET /files/download-stream?path=` |

只有在调用时传入，`cwd`、`env`、`timeout` 才会出现在 shell 的 JSON 里。服务端对 `command` 做分词，不会把它交给 shell。构造时如果给了 token，会以 `Authorization: Bearer` 发送。

```js
import { ServerClient } from "@easy-sandbox/sdk";

const server = new ServerClient("http://127.0.0.1:9000");
if (await server.health()) {
  const ran = await server.process.shell("python3 -c 'print(2 + 2)'");
  console.log(ran.stdout); // "4\n"
}
await server.close();
```

`examples/agent-loop.mjs` 会启动这个本地服务，并执行与 Python 场景 `examples/scenarios/agent_loop_local.py` 相同的四步：健康检查、`python3 -c 'print(2 + 2)'`、写入并读回 `result.txt`、然后 `SIGTERM`。当次真实输出记在 [examples/README.md](examples/README.md)。

## 配置名

`src/config-keys.json` 是规范列表，从 Python 客户端的 `client-sdk/tests/fixtures/config-keys.json` 原样复制。每个 key 恰好对应一个环境变量，没有别名。

产品 key 使用 `EBX_` 前缀：`EBX_SANDBOX_API_KEY`、`EBX_SANDBOX_BASE_URL`、`EBX_SANDBOX_DOMAIN`、`EBX_LLM_API_KEY`、`EBX_PROVIDER`。

厂商已经公开的名字就用厂商的名字：`ALICLOUD_ACCESS_KEY_ID`、`ALICLOUD_ACCESS_KEY_SECRET`、`ALIBABA_CLOUD_REGION_ID`、下表中的 `ACR_*` / `ACREE_INSTANCE_ID`，以及 `GITHUB_TOKEN`。

以下名字**不会**被接受：`E2B_API_KEY`、`SANDBOX_API_KEY`、`AccessKey`、`EBX_ALICLOUD_EXPRESS_ACCESS_KEY_ID`。`readEnv` 只读规范名，所以旁边即使设置了废弃名也不会生效。`EBX_ALICLOUD_EXPRESS_TEAM_ID` 是另一个 key（`team_id`）：厂商没有单独的名字，所以保留这个名字。

```js
import { envName, readEnv } from "@easy-sandbox/sdk";

envName("sandbox_api_key"); // EBX_SANDBOX_API_KEY
envName("access_key_id", "alicloud-express"); // ALICLOUD_ACCESS_KEY_ID
readEnv("sandbox_api_key", process.env);
```

| Key | 作用域 | 环境变量 | 说明 |
| --- | --- | --- | --- |
| `provider` | core | `EBX_PROVIDER` | 默认 provider 标识 |
| `sandbox_api_key` | core | `EBX_SANDBOX_API_KEY` | 沙箱 API Key（任意 E2B 协议端点） |
| `sandbox_base_url` | core | `EBX_SANDBOX_BASE_URL` | 平台 API 地址，任意 E2B 协议端点 |
| `sandbox_domain` | core | `EBX_SANDBOX_DOMAIN` | envd 数据面域名 |
| `http_timeout` | core | `EBX_HTTP_TIMEOUT` | HTTP 请求超时（秒） |
| `http2` | core | `EBX_HTTP2` | 启用 HTTP/2 |
| `max_retries` | core | `EBX_MAX_RETRIES` | 最大自动重试次数 |
| `max_connections` | core | `EBX_MAX_CONNECTIONS` | |
| `max_keepalive_connections` | core | `EBX_MAX_KEEPALIVE_CONNECTIONS` | |
| `keepalive_expiry` | core | `EBX_KEEPALIVE_EXPIRY` | |
| `ws_ping_interval` | core | `EBX_WS_PING_INTERVAL` | |
| `retry_base_delay` | core | `EBX_RETRY_BASE_DELAY` | |
| `log_level` | core | `EBX_LOG_LEVEL` | 日志级别 |
| `default_template` | core | `EBX_DEFAULT_TEMPLATE` | 未指定模板时使用的模板 |
| `llm_api_key` | core | `EBX_LLM_API_KEY` | AI 代码生成使用的 LLM API Key |
| `llm_base_url` | core | `EBX_LLM_BASE_URL` | LLM 端点（OpenAI 兼容） |
| `llm_model` | core | `EBX_LLM_MODEL` | LLM 模型名 |
| `github_token` | core | `GITHUB_TOKEN` | 用于模板索引的 GitHub Token |
| `template_index_url` | core | `EBX_TEMPLATE_INDEX_URL` | |
| `template_dir` | core | `EBX_TEMPLATE_DIR` | |
| `mcp_auth_token` | core | `EBX_MCP_AUTH_TOKEN` | |
| `mcp_allowed_origins` | core | `EBX_MCP_ALLOWED_ORIGINS` | |
| `mcp_runtime_dir` | core | `EBX_MCP_RUNTIME_DIR` | |
| `region` | alicloud-express | `ALIBABA_CLOUD_REGION_ID` | 地域（用于推导 API 地址和域名） |
| `access_key_id` | alicloud-express | `ALICLOUD_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `access_key_secret` | alicloud-express | `ALICLOUD_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |
| `acr_namespace` | alicloud-express | `ACR_NAMESPACE` | ACR 命名空间 |
| `acr_registry` | alicloud-express | `ACR_REGISTRY` | ACR 仓库地址 |
| `acr_repo` | alicloud-express | `ACR_REPO` | ACR 仓库 |
| `acr_username` | alicloud-express | `ACR_USERNAME` | ACR 用户名 |
| `acr_password` | alicloud-express | `ACR_PASSWORD` | ACR 密码 |
| `acr_instance_id` | alicloud-express | `ACREE_INSTANCE_ID` | ACR 企业版实例 ID |
| `acr_vpc_id` | alicloud-express | `ACR_VPC_ID` | ACR VPC ID |
| `acr_vswitch_ids` | alicloud-express | `ACR_VSWITCH_IDS` | ACR 交换机 ID（逗号分隔） |
| `acr_security_group_id` | alicloud-express | `ACR_SECURITY_GROUP_ID` | ACR 安全组 ID |
| `team_id` | alicloud-express | `EBX_ALICLOUD_EXPRESS_TEAM_ID` | 团队 ID |

## 这个包不做的事

- `Sandbox.create`、模板，或任何云控制面
- provider 驱动（阿里云极速版也只出现在环境变量名表里）
- 沙箱内的服务端本身（`easy-sandbox-server` 仍是 Python）
- PTY、browser、devtools，以及 Python `ServerClient` 的其余接口
- Claude、Cursor、Qoder 适配器

## 许可证

Apache-2.0。见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。
