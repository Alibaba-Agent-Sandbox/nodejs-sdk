# Example official-index verification

Date: 2026-10-25
Result: PASS (local checks; remote delivery is a separate gate)

Scope: one example installation command based on main
`a4e24a81d9a6305a7a6e992fd9cec6077587537a`, plus changelog and records.
Python 3.13.13 in a new virtual environment; Node 22.22.2, npm 12.0.2.
No repository Python source or PYTHONPATH was injected.

Executed checks:

- `python3 -m pip install --index-url https://pypi.org/simple 'agent-sandbox-server==0.4.0a2'`: exit 0, installed exact public a2.
- `python3 -m pip check`: exit 0, no broken requirements.
- `npm ci`: exit 0, installed the lockfile unchanged.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0; 24 passed, 0 skipped, including actual local Python server loop.
- `node examples/agent-loop.mjs`: exit 0; actual HTTP health true, shell exit 0
  and stdout `4\n`, file roundtrip `answer=4\n`, owned process SIGTERM exit -15.
- `npm pack --dry-run`: exit 0, package ESM/type exports listed; no package published.
- `git diff --check` and new record-link existence checks: exit 0.

The new environment's installation can use pip's content cache; the command
explicitly selects official PyPI instead of a user-configured mirror. These are
local runtime/HTTP checks, not cloud lifecycle or model acceptance. No cloud
resources were created. Latest-head CI/review and actual merge remain to verify.
