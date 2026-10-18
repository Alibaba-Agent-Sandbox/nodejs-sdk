# Local agent loop

This starts `python3 -m agent_sandbox.server serve` and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`.

```bash
npm run build
node examples/agent-loop.mjs
```

Original recorded environment: `PYTHONPATH` was `/workspace/python-sdk/server-sdk/src:/workspace/python-sdk/client-sdk/src`. The work directory is `/tmp/abx-agent-loop-node`. No cloud API key is used. The server uses its default endpoint set; `ABX_SERVER_ENABLED_GROUPS` is not set.

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
python3 -m pip install 'agent-sandbox-server @ https://github.com/Alibaba-Agent-Sandbox/python-sdk/archive/e86cb0be24e0083a27396b260298e7cf27b660d6.tar.gz#subdirectory=server-sdk'
npm ci
npm test
node examples/agent-loop.mjs
```

当前示例使用已安装的 Python 服务端，并原样保留调用方 `PYTHONPATH`，不再添加固定仓库路径。
先按上面的固定源码安装运行时。开发中的服务端也可通过调用方 `PYTHONPATH` 提供；
上方历史输出的环境路径仅记录原来的运行环境。该示例验证本地 HTTP、命令、文件与进程清理，
不代表云端 `Sandbox.create`。
