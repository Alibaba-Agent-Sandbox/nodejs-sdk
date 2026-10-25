# Fresh documented Node example — 2026-10-25

Result: PASS — local runtime verification; remote CI/publication are separate.

Source under test: main `f473f7d89d26141b243595958615d02151af2d49`; source files unchanged. Python 3.13.13, Node 22.22.2, public client/server 0.4.0a1 installed from official PyPI in a new virtual environment. No source PYTHONPATH override supplied.

Executed `npm ci`, `npm run build`, `node examples/agent-loop.mjs` with that Python environment on PATH, `npm run typecheck` and `npm test`: all exit 0; 24 tests pass. The actual local server answered health, executed Python with stdout `4\n`, returned file bytes `answer=4\n`, then exited after SIGTERM (`-15`). The example's finally cleanup completed. No cloud resources or model calls occurred.

Initial report of a fixed development path came from the stale workspace checkout; current main already removed it. The Issue was corrected rather than asserting a nonexistent runtime bug. This PR changes documentation/records only.
