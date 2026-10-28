# Agent Sandbox Node.js SDK

**English** | [中文](README.zh-CN.md)

Call sandbox application services from JavaScript or TypeScript. `@agent-sandbox/sdk` provides an HTTP `ServerClient` for running shell commands and transferring files, plus shared configuration-name helpers.

Requires Node.js 20+ and ESM. Create the sandbox and start its service with the [abx CLI](https://github.com/Alibaba-Agent-Sandbox/agent-sandbox) or [Python SDK](https://github.com/Alibaba-Agent-Sandbox/python-sdk); this package connects to that running service.

## Install

Build the package from source:

```bash
git clone https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk.git
cd nodejs-sdk
npm ci
npm run build
npm pack
```

In your application, install the generated `agent-sandbox-sdk-0.1.0.tgz` archive, using its actual path:

```bash
npm install ../nodejs-sdk/agent-sandbox-sdk-0.1.0.tgz
```

The SDK is currently distributed from source; the public npm package is not available.

## Quick start

Use a running `agent-sandbox-server` endpoint. The [local example](examples/README.md) explains how to start one.

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

`ABX_SERVER_TOKEN` is the application token configured for that service. For provider gateways, pass the exact service URL and the provider's `gatewayHeaders`; see [authentication and gateway connections](docs/server-client.md). Keep the application token separate from the provider API key.

## Supported operations

| Method | Purpose |
| --- | --- |
| `health()` | Check the application service |
| `process.shell(command, options)` | Execute a process and read its result |
| `files.upload(path, data)` | Upload bytes |
| `files.download(path)` / `files.readText(path)` | Download bytes or text |
| `close()` | Release the client |

Commands are tokenized by the server; use `sh -c` when shell expansion or pipes are needed. Cloud lifecycle, interpreter, PTY and browser clients are outside this package's current scope. Closing the HTTP client leaves the sandbox running; delete the sandbox through the tool that created it.

## Configuration helpers

```js
import { envName, readEnv } from "@agent-sandbox/sdk";

envName("sandbox_api_key"); // ABX_SANDBOX_API_KEY
readEnv("sandbox_api_key", process.env);
```

These helpers look up names and values; they do not configure `ServerClient` or execute provider operations. See the [configuration reference](docs/configuration.md) for the complete table.

## Development

Run `npm ci`, `npm run typecheck` and `npm test`. The tests build the SDK first. See [examples](examples/README.md) for the local agent loop and its Python runtime prerequisite. Report problems in [Issues](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues).

## License

[Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution.
