# @agent-sandbox/sdk

**中文** | [English](README.md)

[Agent Sandbox](https://github.com/alibaba-agent-sandbox/python-sdk) 的 Node.js 客户端。需要 Node.js 20 或更高版本，仅提供 ESM。

本包是 Node.js SDK 的**第一片**。它包含：

- **配置名表**（每个 key 对应一个环境变量）
- `ServerClient`：面向 `agent-sandbox-server`（`agent_sandbox.server`）的**沙箱内 HTTP 客户端**

它**不是** `Sandbox.create`、云 provider 或 server SDK 的移植。创建云沙箱仍属于 Python SDK 和 `abx` CLI。

## 安装

2026-10-18 查询公开 npm 的 `@agent-sandbox/sdk` 元数据返回404。
配置的包索引具备对应版本前，请从源码构建安装包：

```bash
git clone https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk.git
cd nodejs-sdk
npm ci
npm run build
npm pack
```

当前源码版本0.1.0 生成 `agent-sandbox-sdk-0.1.0.tgz`，包含构建后的 `dist/` 导出。
在应用项目中安装生成的归档：

```bash
npm install /absolute/path/to/agent-sandbox-sdk-0.1.0.tgz
```

配置的包索引具备对应发布后，可以使用 `npm install @agent-sandbox/sdk`，导入接口一致。
本说明不代表包已经发布。开发时 `npm test` 会构建并运行 `node:test`；真实本地示例
需要按[示例说明](examples/README.md)先安装 Python 服务端。

## ServerClient

`ServerClient` 通过 HTTP 访问 `python3 -m agent_sandbox.server serve` 启动的进程（默认端口 9000）。本地 agent 循环用到的是下面四个调用，它们默认开启：

| 方法 | 请求 |
| --- | --- |
| `health()` | `GET /health` |
| `process.shell(command)` | `POST /shell`，JSON `{ "command": "..." }` |
| `files.upload(path, data)` | `POST /files/upload-stream`，JSON `{ "path", "content_base64" }` |
| `files.download(path)` / `files.readText(path)` | `GET /files/download-stream?path=` |

只有在你设置了 `cwd`、`env`、`timeout` 时，它们才会出现在 shell 请求体里。服务端对 `command` 做分词，不会交给 shell。构造时传入的 bearer token 会以 `Authorization: Bearer` 发送（与 `ABX_SERVER_TOKEN` 是同一个密钥）。

可选能力组（`dev_tools`、`browser`、`agents`）默认关闭，只有 `ABX_SERVER_ENABLED_GROUPS` 列出它们时才打开。这是唯一的分组开关。Agents 路由的响应带 `X-Agent-Sandbox-*` 头（例如 `X-Agent-Sandbox-Local`）。本客户端不调用那些路由。

```js
import { ServerClient } from "@agent-sandbox/sdk";

const server = new ServerClient("http://127.0.0.1:9000");
if (await server.health()) {
  const ran = await server.process.shell("python3 -c 'print(2 + 2)'");
  console.log(ran.stdout); // "4\n"
}
await server.close();
```

`examples/agent-loop.mjs` 会启动这个本地服务，并执行与 Python 场景 `examples/scenarios/agent_loop_local.py` 相同的四步：健康检查、`python3 -c 'print(2 + 2)'`、写入并读回 `result.txt`、然后 `SIGTERM`。记录见 [examples/README.md](examples/README.md)。

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

## 本包不做的事

- `Sandbox.create`、模板，或任何云控制面
- provider 驱动（阿里云极速版只出现在环境变量名表里）
- 沙箱内的服务端本身（`agent-sandbox-server` 仍是 Python）
- PTY、浏览器、devtools，以及 Python `ServerClient` 的其余接口

## 许可

Apache-2.0。见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。

Configuration storage uses one `storage` descriptor. / 配置存储统一使用 `storage` 字段。

通过提供方端口网关访问时，应传入包含完整代理前缀、沙箱和端口标识及查询参数
的 URL。客户端保留原查询参数的字节，仅追加操作参数，禁止覆盖网关参数。
所有重定向均会拒绝，包括同一域名下跳转到另一沙箱；URL 用户信息及越出绑定
前缀的操作路径也会拒绝。URL 归一化之前即检查原始或多层编码的控制字符、
路径分隔符与点路径；基址和操作都不能引入重复或多层编码后等价的网关查询键。

`token` 用于应用服务令牌，`gatewayHeaders` 用于平台网关请求头，`headers`
用于其他应用请求头。各组请求头名称不能重叠；已有 `Authorization` 请求头时
不能再传入 `token`。不能覆盖 Host 等寻址及传输请求头。公开 `baseUrl` 和连接
错误省略查询凭据。不要把平台控制面 API Key 作为应用令牌传入。本客户端使用
绑定代理前缀的 HTTP URL；按操作签名的路径绑定需要使用提供方适配器的逐操作传输接口，不能传入本前缀客户端。
