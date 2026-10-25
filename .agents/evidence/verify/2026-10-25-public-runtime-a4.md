# Public a4 runtime guidance verification

Date: 2026-10-25
Result: PARTIAL (public installation/local runtime PASS; latest-head CI/review/merge pending)

Base: main 2308aec369c60e451be0cc9f9c34e245a93a3104. No Node implementation,
export, dependency range or version change. Package remains source-only 0.1.0.
The earlier a3 decision was accepted by PR18 and is moved to implemented; no
merged evidence is rewritten.

## Actual installation and checks

Python 3.13.13 new virtual environment installed exact
`agent-sandbox-client[all]==0.4.0a4` from official PyPI with `--no-cache-dir`;
matching server installed automatically, imports resolved in that environment,
and `pip check` passed. No repository PYTHONPATH was injected. Existing Node
22.22.2/npm12.0.2 lockfile installation used `npm ci`.

- `npm run typecheck`: PASS.
- `npm test`: 24 PASS, zero fail/skip, including actual local Python runtime tests.
- `node examples/agent-loop.mjs`: actual health true, shell stdout `4\n`, file
  `answer=4\n`, and exact server exit -15 after SIGTERM. A read-only spawn
  observer recorded the one explicit example server PID; a separate process
  existence check confirmed it absent. Example source was unchanged.
- Installed Python complete configuration-schema JSON equals src/config-keys.json.
- `npm pack --dry-run`: PASS, ESM/type exports present. No upload.
- `git diff --check` and record-link existence: PASS.

[Structured local receipt](2026-10-25-public-runtime-a4-local.json).

The Python publisher first failed after six metadata visibility checks over 50s,
then completed its normal failed-job rerun successfully on the same tag. Original
and rerun artifacts matched each other and public metadata/downloads. This record
uses the independently installed public package after that successful recovery;
it does not reinterpret the original failure as success. Producer:
https://github.com/Alibaba-Agent-Sandbox/python-sdk/actions/runs/40215483508.

No cloud resource or real model was used. This is not Node cloud lifecycle,
all-template coverage or npm publication. Required Node20/22 checks and normal
review/merge for this new source head remain pending.
