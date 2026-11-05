# HTTP client reference

[中文](server-client.zh-CN.md)

Back to the [README](../README.md).

## ServerClient

`ServerClient` speaks HTTP to a server started with `python3 -m agent_sandbox.server serve` (default port 9000). These endpoints are enabled by default; application functions must be registered before invocation:

| Method | Request |
| --- | --- |
| `health()` | `GET /health` |
| `process.shell(command)` | `POST /shell` with JSON `{ "command": "..." }` |
| `files.upload(path, data)` | `POST /files/upload-stream` with JSON `{ "path", "content_base64" }` |
| `files.download(path)` / `files.readText(path)` | `GET /files/download-stream?path=` |
| `commands.list()` | `GET /commands` |
| `commands.invoke(name, arguments, options)` | `POST /commands/{name}` with the argument object as JSON |

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

`examples/agent-loop.mjs` starts that local server and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`. The recorded run is in [examples/README.md](../examples/README.md).

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

## Registered application commands

Start the service with its command module loaded, for example `python3 -m agent_sandbox.server serve --commands commands.py`. `commands.list()` returns the visible command names, descriptions and argument metadata. Functions registered with `@command()` are application business commands; they are separate from shell execution and provider management.

```js
const commands = await server.commands.list();
const result = await server.commands.invoke("job", {
  timeout: 5,
  name: "daily-report",
}, { requestTimeout: 30 });
```

`requestTimeout` is an HTTP timeout in seconds. Business arguments are sent unchanged as the JSON object, including keys named `timeout`, `name` or `arguments`. The result may be any JSON value, including `null`. TypeScript callers may select a result type with `invoke<Result>(...)`; runtime validation of a business result remains the caller's responsibility.

Invocation preserves `ServerAPIError.statusCode`, `errorType` and `errorCode` for server rejections and failures. A timed-out request raises `ConnectionError`; the remote function may still have run. Invocations are never retried automatically. The server must permit the command for the authenticated identity.

Request timeouts accept fractional seconds, rounded up to milliseconds; the maximum is 2147483.647 seconds. Invalid values fail before sending a request.
