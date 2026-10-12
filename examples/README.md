# Local agent loop

This starts `python3 -m easy_sandbox.server serve` and runs the same four steps as the Python scenario `examples/scenarios/agent_loop_local.py`: health, `python3 -c 'print(2 + 2)'`, write and read `result.txt`, then `SIGTERM`.

```bash
npm run build
node examples/agent-loop.mjs
```

`PYTHONPATH` is `/workspace/python-sdk/server-sdk/src:/workspace/python-sdk/client-sdk/src`. The work directory is `/tmp/ebx-agent-loop-node`. No cloud API key is used.

Recorded on 2026-10-12 from that command (exit 0). The port is chosen at runtime.

```text
step 1  create
  server  http://127.0.0.1:37831
  health  true
step 2  exec
  exit    0
  stdout  '4\n'
  stderr  ''
step 3  read result
  wrote   /tmp/ebx-agent-loop-node/base/result.txt (9 bytes)
  read    'answer=4\n'
step 4  kill
  signal  SIGTERM
  return  -15
```

`return -15` is the process group receiving SIGTERM (signal 15). `health true` is the JavaScript boolean; the shell stdout is the two characters `4` and a newline, and the file read back is `answer=4\n`.

`node --test` on 2026-10-12:

```text
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

## 本地 agent 循环

上面的输出就是同一次真实运行。脚本做的四步与 Python 版相同：健康检查、执行 `python3 -c 'print(2 + 2)'`、写入并读回 `result.txt`、发送 `SIGTERM`。这不是 `Sandbox.create`。
