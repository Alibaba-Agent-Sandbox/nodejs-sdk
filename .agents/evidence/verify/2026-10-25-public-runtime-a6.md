# Public a6 runtime guidance preparation

Date: 2026-10-25
Result: PARTIAL — public a6/local checks PASS; latest-head CI, independent review and normal merge remain pending.

Base: main 0351fd565d00e675288e7d7b528d10aea3cd7573, the verified normal
PR19 merge. Source behavior, package/lock, exports and version are unchanged.
The prior a4 installation decision is accepted; its old evidence remains intact.
At the initial preparation checkpoint, this draft selected only the next
example install and exact schema tag. Public a6 installation, Node checks and
normal CI/review/merge had not run; the later formal results are recorded below.
No cloud resources were created.

## Preparation-only checks before public a6

- `npm ci`: PASS using the tracked lockfile.
- `npm run typecheck`: PASS.
- `npm test` without the required Python server installed on PATH: 22 PASS,
  2 FAIL. Both real local agent-loop tests failed with ModuleNotFoundError for
  agent_sandbox; this is an unmet declared setup prerequisite, not proof of a
  Node runtime defect. No test was skipped or weakened.
- The chained package dry-run did not run because npm test failed.

After official a6 publication, repeat the documented installation with its
Python executable on PATH, then run all Node gates/example and independent
owned-process absence checks. Do not relabel this attempt as a6 acceptance.

## Formal public a6 verification

Python source/tag: v0.4.0a6 at 8e610a3658040d8d6973e7951f9590ea50a4d70a.
The producer publisher40225846586 completed successfully on attempt1. Its exact
four preserved files match official metadata and actual downloads. A new Python
3.13.13 environment installed official client[all]6 and matching server6 with
no-cache, a fresh HOME and no PYTHONPATH; pip check passed. Node used that
installed interpreter on PATH without source injection.

- `npm run typecheck`: PASS on the unchanged source.
- `npm test`: PASS, 24/24, including the real installed-server loop.
- `node examples/agent-loop.mjs`: PASS, health true, shell4, exact9-byte file,
  SIGTERM and return -15.
- Independent observation: all three directly owned Python PIDs absent.
- Complete configuration schema: equals installed Python config_keys JSON.
- `npm pack --dry-run --json`: PASS, 22 files including ESM, type declarations,
  configuration JSON, bilingual READMEs, LICENSE and NOTICE.

The first independent package-receipt parser assumed an array, while this npm
version returned an object keyed by package name; it raised KeyError0. Only that
external observer was corrected, using the same retained npm output. No package
code or gate was changed. The earlier 22PASS/2missing-prerequisite failures stay
recorded above. Local checks create no cloud resource; source version0.1.0 is
unchanged and no npm publication is claimed. Latest-head Node20/22 CI/review and
normal merge are still required.
