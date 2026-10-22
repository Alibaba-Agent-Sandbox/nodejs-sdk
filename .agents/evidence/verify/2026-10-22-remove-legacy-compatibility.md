# Verification: remove retired project compatibility

- Date: 2026-10-22
- Result: PARTIAL (remote acceptance pending)
- Revision: scoped files in branch `refactor/remove-legacy-20261022`; the containing commit is the reviewable source revision.
- Environment: Linux, Node.js 22.22.2; Python 3.11.15 in an isolated environment.
- Issue: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/6

## What was verified

Retired project APIs, migration fields and fallbacks are removed rather than forwarded. Tests and bilingual documentation describe one current contract. Historical engineering evidence is preserved.

## Commands and results

- PASS: `npm ci`, `npm run typecheck`.
- PASS: `npm test` with the matching Python server source/interpreter available — 11 tests passed, including rejection of removed retry keys/environment names.
- PASS: `node examples/agent-loop.mjs` against the current real local Python server — health, process output `4\n`, file round trip `answer=4\n` and process termination.
- PASS: schema synchronized from `python -m agent_sandbox.utils.config_keys --json`; one `storage` descriptor, no inert retry fields.
- PASS: `git -c core.filemode=false diff --check`.

## Outstanding gates

Required remote CI, review and merge are not established by local results. Initial Git invocations had not loaded the ignored workspace credential file; authenticated fetch and GitHub access now succeed. No package release or manual production deployment is requested. Cross-repository consumers must land after their shared contract.

## Cleanup

Local fixtures use owned temporary resources. The Python cloud fixture tracks and cleans its own sandbox resources. No raw credentials or sensitive logs are included. Native checks that did not execute are not passes.

## Remote delivery update

The first Node20/22 CI run compared against the previous pinned Python schema and failed at that comparison. CI now pins the published Python cleanup source commit; the complete local Python/Node schema comparison passes. The consumer will not merge before the Python contract.
