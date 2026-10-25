# Public server a3 Node guidance verification

Date: 2026-10-25
Result: PASS (local verification and source CI; merge pending)

Base: main 63d7cd8ece221b9f968eef51eeb932ea334c90d3. Changes only current example,
CI source/runtime version, changelog and records. Node 22.22.2, npm 12.0.2;
Python 3.13.13 with installed public client/server 0.4.0a3 from a fresh official-index
no-cache installation. No PYTHONPATH source injection.

- `npm ci`, `npm run typecheck`, `npm test`: exit 0; all 24 tests passed.
- `node examples/agent-loop.mjs`: exit 0; actual health true, shell stdout `4\n`,
  file `answer=4\n` and owned server SIGTERM exit -15.
- `npm pack --dry-run`: exit 0; built ESM/types present. No package uploaded.
- Public Python config-key JSON equals the complete Node schema: PASS.
- Official npm SDK metadata returned 404; existing source-install guidance remains
  accurate. This is not publication of a Node package.
- Scoped record-link existence and `git diff --check`: PASS.

No cloud resource was created. Exact source head
`d539578b6ee7d205c353a742a6fb52d56e676a4c` completed both Node 20/22 checks
SUCCESS; [CI receipt](2026-10-25-current-public-server-a3-ci.json) preserves their
identities and links. This record-only follow-up requires its own head CI and
independent review before merge. Earlier a2 receipts are unchanged.
