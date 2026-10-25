# Local agent loop

This starts `python3 -m agent_sandbox.server serve` and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`.

```bash
npm run build
node examples/agent-loop.mjs
```

The example uses an installed Python runtime and chooses a free local port.
No cloud credential is required.

Recorded from that command (exit 0). The port is chosen at runtime.

```text
step 1  create
  server  http://127.0.0.1:<port>
  health  true
step 2  exec
  exit    0
  stdout  '4\n'
  stderr  ''
step 3  read result
  wrote   /tmp/abx-agent-loop-node/base/result.txt (9 bytes)
  read    'answer=4\n'
step 4  kill
  signal  SIGTERM
  return  -15
```

`return -15` is the process group receiving SIGTERM (signal 15). `health true` is the JavaScript boolean; the shell stdout is the two characters `4` and a newline, and the file read back is `answer=4\n`.

## 本地 agent 循环

上面的输出就是同一次真实运行的形状。脚本做的四步与 Python 版相同：健康检查、执行 `python3 -c 'print(2 + 2)'`、写入并读回 `result.txt`、发送 `SIGTERM`。这不是 `Sandbox.create`。

## Portable runtime setup / 可移植运行环境

The current example uses an installed Python runtime and preserves caller
`PYTHONPATH`; it adds no fixed repository paths. Install the server before running:

```bash
python3 -m pip install 'agent-sandbox-server==0.4.0a2'
npm ci
npm test
node examples/agent-loop.mjs
```

当前示例使用已安装的 Python 服务端，并原样保留调用方 `PYTHONPATH`，不再添加固定仓库路径。
先按上面的公开 alpha 版本安装运行时。开发中的服务端也可通过调用方 `PYTHONPATH` 提供；
该示例验证本地 HTTP、命令、文件与进程清理，
不代表云端 `Sandbox.create`。

## Fresh published-runtime verification — 2026-10-25

A fresh Python 3.13 environment (no repository source injection) with public `agent-sandbox-server==0.4.0a2`, followed by the documented `npm ci`, `npm run build` and `node examples/agent-loop.mjs`, passed. The shell returned `4\n`, the downloaded file matched `answer=4\n`, and the owned server process exited after SIGTERM. `npm run typecheck` and all 24 Node tests passed. No cloud resource or model API was used.

2026-10-25 已从全新环境安装公开 Python 服务端 0.4.0a2，再按上述命令构建和运行示例。命令输出、文件内容和服务进程清理均通过；类型检查及 24 个测试通过。本次是实际本地 HTTP 运行，不代表云端或模型调用测试。
