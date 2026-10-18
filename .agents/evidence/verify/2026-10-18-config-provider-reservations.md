# Verification: Node configuration reservations and source installation

- Date: 2026-10-18
- Base: `90335324461b6d01e361908211b7d69a4c57305b`.
- Authority: Python SDK `145341d462df2f4753c03a62365114f1872acd1a`.
- Result: PARTIAL (local acceptance complete; new exact-head CI/review pending).
- Environment: Linux; Node 22.22.2; npm 12.0.2; matching server 0.3.0 with Python 3.12.15.

## Reproduction and authority

The actual `config_keys.py --json` export from the pinned Python source and the
unchanged Node JSON differ only at `reserved_provider_ids`: Node additionally
reserves `e2b`. All 23 key entries and other metadata agree. After the one-id fix,
the complete parsed JSON structures match. CI repeats the full-structure comparison
against a pinned source checkout rather than fetching mutable main or only checking
one field.

The new public-export test was executed after `npm run build` against the unchanged
schema: **1 FAIL**, with `true !== false`. This is a real negative control through
`dist/index.js`, not an assertion about source prose.

An anonymous GET to `https://registry.npmjs.org/@agent-sandbox%2Fsdk` returned
HTTP 404 and `{ "error": "Not found" }`. No authentication header was sent.
The publication statement is a dated observation, not a future availability claim.

## Commands and results

- `npm ci`: PASS, committed lockfile unchanged.
- `npm run typecheck`: PASS.
- `npm test` with matching `python3` server environment: **9 PASS / zero SKIP**,
  821.36 milliseconds; includes the public export and actual local server loop.
- `node examples/agent-loop.mjs` with the same Python environment: PASS; health,
  command stdout `4` plus newline, file round trip, SIGTERM and reaped process.
- Complete JSON comparison with actual pinned Python `--json` output: PASS.
- `npm pack --json`: PASS, 22 package files. Fresh temporary consumer installs
  from both the built local checkout and the packed tarball: PASS. Each imports
  `@agent-sandbox/sdk`, verifies `e2b` is unreserved, keeps the builtin reservation,
  resolves the existing env name and exports `ServerClient`.
- The first verification harness assumed array-shaped npm JSON and stopped before
  consumer installation. Local npm returned an object keyed by package name;
  correcting only the harness enabled the two actual successful installations.
- Workflow YAML parses; the whole-schema comparison step uses the pinned source's
  real `--json` export and compares complete JSON structures.
- Scoped diff and relative engineering-record links: PASS.

## CI and review scope

The repository had no tracked workflow and its remote workflow count was zero.
This change introduces normal Node 20/22 checks with fixed Python 3.12.15, the pinned
server source, lockfile installation, whole-schema comparison, typecheck and existing
real local tests. No package publishing step, cloud credential or cloud operation
is added. Local Node 22 success does not replace the pending Node 20/22 hosted run.

## Cleanup and limits

Temporary consumer projects/artifacts are task-owned and removed after validation.
The local server process is terminated and reaped by the existing loop; no cloud
resource was created. Public npm publication, Node cloud-provider execution and
real native-provider acceptance are outside this change. Existing unrelated original
checkout engineering proposals remain untouched.
