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
python3 -m pip install --index-url https://pypi.org/simple 'agent-sandbox-server==0.4.0a6'
npm ci
npm test
node examples/agent-loop.mjs
```

当前示例使用已安装的 Python 服务端，并原样保留调用方 `PYTHONPATH`，不再添加固定仓库路径。
上面的 a6 版本已从官方 PyPI 安装验证。开发中的服务端也可通过调用方 `PYTHONPATH` 提供；
该示例验证本地 HTTP、命令、文件与进程清理，
不代表云端 `Sandbox.create`。

## Published-runtime verification — 2026-10-25

A new Python 3.13 environment installed official public client/server a6 without
source injection. The documented Node checks passed: typecheck, all 24 tests,
the unchanged local example, and package dry-run. The real server returned
`4\n`, the file read back as `answer=4\n`, and SIGTERM ended the process.
All three observed owned Python processes were independently confirmed absent.
The complete exported configuration schema matched the installed public SDK.
No cloud lifecycle, model call or npm publication is established by this local run.
The earlier a4 receipt remains unchanged.

全新 Python 3.13 环境已从官方 PyPI 安装 a6 配套包，不注入源码。类型检查、24 个测试、
原样本地示例和打包预检均通过；实际命令、文件读回与 SIGTERM 清理均通过，三个本次
观察到的 Python 进程另行确认已退出，完整配置名称契约也与公开 SDK 一致。本次是本地
HTTP 验证，不代表云端生命周期、模型调用或 npm 发布；旧 a4 记录保持不变。
