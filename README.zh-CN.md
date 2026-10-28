# Agent Sandbox Node.js SDK

**中文** | [English](README.md)

在 JavaScript 或 TypeScript 中调用沙箱应用服务。`@agent-sandbox/sdk` 提供用于执行命令和传输文件的 HTTP `ServerClient`，以及共享配置名查询工具。

需要 Node.js 20+，仅支持 ESM。先用 [abx CLI](https://github.com/Alibaba-Agent-Sandbox/agent-sandbox) 或 [Python SDK](https://github.com/Alibaba-Agent-Sandbox/python-sdk)创建沙箱并启动服务，再通过本包连接。

## 安装

从源码构建安装包：

```bash
git clone https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk.git
cd nodejs-sdk
npm ci
npm run build
npm pack
```

在应用项目中安装生成的 `agent-sandbox-sdk-0.1.0.tgz`，按实际位置调整路径：

```bash
npm install ../nodejs-sdk/agent-sandbox-sdk-0.1.0.tgz
```

SDK 目前通过源码分发，公开 npm 包尚不可用。

## 快速开始

准备一个已运行的 `agent-sandbox-server` 端点，启动方法见[本地示例](examples/README.md)。

```js
import { ServerClient } from "@agent-sandbox/sdk";

const server = new ServerClient("http://127.0.0.1:9000", {
  token: process.env.ABX_SERVER_TOKEN,
});
try {
  if (await server.health()) {
    const result = await server.process.shell("python3 -c 'print(2 + 2)'");
    console.log(result.stdout);
    await server.files.upload("/tmp/result.txt", Buffer.from(result.stdout));
    console.log(await server.files.readText("/tmp/result.txt"));
  }
} finally {
  await server.close();
}
```

`ABX_SERVER_TOKEN` 是该服务配置的应用认证令牌。连接提供方网关时，应使用完整服务地址及提供方的 `gatewayHeaders`，详见[认证与网关连接](docs/server-client.zh-CN.md)。应用令牌与提供方 API Key 分开使用。

## 支持的操作

| 方法 | 用途 |
| --- | --- |
| `health()` | 检查应用服务 |
| `process.shell(command, options)` | 执行进程并读取结果 |
| `files.upload(path, data)` | 上传字节 |
| `files.download(path)` / `files.readText(path)` | 下载字节或文本 |
| `close()` | 释放客户端 |

服务端会拆分命令参数，需要变量展开或管道时使用 `sh -c`。当前包不提供云端生命周期、解释器、PTY 或浏览器客户端。关闭 HTTP 客户端后沙箱仍在运行，应通过创建沙箱的工具将其删除。

## 配置工具

```js
import { envName, readEnv } from "@agent-sandbox/sdk";

envName("sandbox_api_key"); // ABX_SANDBOX_API_KEY
readEnv("sandbox_api_key", process.env);
```

这些工具只查询配置名和读取值，不会配置 `ServerClient` 或执行提供方操作。完整表格见[配置参考](docs/configuration.zh-CN.md)。

## 开发

运行 `npm ci`、`npm run typecheck` 和 `npm test`，测试会先构建 SDK。本地 Agent 循环及其 Python 运行时前提见[示例](examples/README.md)。问题请提交到 [Issues](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues)。

## 许可证

[Apache-2.0](LICENSE)，署名信息见 [NOTICE](NOTICE)。
