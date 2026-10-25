# Public runtime a2 Node example verification

Date: 2026-10-25
Result: PASS

Tested scope: Node SDK source based on main 82bd968, with installed public Python
client/server 0.4.0a2 in a fresh Python 3.13 environment. No PYTHONPATH injection.
Node 22.22.2; dependencies previously installed reproducibly with npm ci.

- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 24 tests passed.
- `node examples/agent-loop.mjs`: exit 0. Actual HTTP health true, command stdout
  `4\n`, downloaded file `answer=4\n`, owned server SIGTERM exit -15.

These are local runtime/HTTP results, not cloud lifecycle/model acceptance. No
cloud resources were created. Exact public package installation and pip check
were independently verified before these commands. Latest-head remote CI/merge
are delivery checks to verify separately; no npm publication is claimed.
