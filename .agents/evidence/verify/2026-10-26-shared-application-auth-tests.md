# Verification: shared application authentication tests

- Date: 2026-10-26
- Result: PASS for the unchanged runtime and shared test contract
- Change: test fixture and ServerClient authHeaders regressions; runtime source unchanged.
- Environment: Node 22.22.2, Python 3.13; source client/server 0.4.0a6 in an isolated virtual environment.

## Commands run

- `npm ci --ignore-scripts --no-audit --no-fund` — PASS.
- `npm run typecheck` — PASS.
- `npm test` without the Python runtime on PATH — FAIL: two existing agent-loop tests could not import the server; 27 other tests passed.
- `npm test` with the isolated Python runtime on PATH — PASS: 29 tests including the real local server loop and all five common authentication vectors.

## Cleanup

Local server processes were stopped by their existing tests. No cloud resources created.

## Not verified

The canonical fixture is byte-identical to Python owner commit 98642ae6712a5017e187cae7952a2b3c819c1ece; CI checks that pinned copy. PR https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/21 passed both required Node 20 and Node 22 jobs at f25a18ed41a30091f7029b864e621938f8b441db. Owner dependency https://github.com/Alibaba-Agent-Sandbox/python-sdk/pull/142 must land first; latest-head checks/review and merge are verified separately. This is not an npm publication or whole-template cloud claim.
