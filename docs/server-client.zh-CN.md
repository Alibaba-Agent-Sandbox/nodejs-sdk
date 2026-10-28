# HTTP 客户端参考

[English](server-client.md)

返回 [README](../README.zh-CN.md)。

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

`examples/agent-loop.mjs` 会启动这个本地服务，并执行与 Python 场景 `examples/scenarios/agent_loop_local.py` 相同的四步：健康检查、`python3 -c 'print(2 + 2)'`、写入并读回 `result.txt`、然后 `SIGTERM`。记录见 [examples/README.md](../examples/README.md)。

## 网关与应用认证

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

显式应用 `token` 还会通过 `X-Access-Token` 发送，前提是调用方提供的请求头未占用该名称（不区分大小写）。Bearer 仍然保留以兼容现有服务。每次请求复制调用方与网关请求头，不会覆盖它们；未提供 token 时不会添加应用凭据。该行为使用服务端已有认证请求头，兼容剥离 Authorization 的服务端代理。
