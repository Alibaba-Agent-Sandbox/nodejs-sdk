# Decision: Index recent changes to node application http client
Status: proposed

## Problem

Recent implementation, user-experience changes and delivery status are spread across
owner records, pull requests and workspace reports. The user requested that recent
changes be retained under each owning repository's `.agents/` and pushed.

## Decision

Keep this dated index in nodejs-sdk; link existing canonical decisions and immutable
verification instead of copying their reports or rewriting historical acceptance.
This index adds no product behavior and does not change any older ADR's lifecycle.

### Owner changes and canonical records

The candidate adds bilingual named deploy/status/delete guidance for obtaining the endpoint passed to ServerClient. It changes no runtime code, dependency or public export. The SDK remains an application HTTP client; it does not become a cloud lifecycle, template-build, PTY or interpreter SDK.

- [Current-source CLI guidance](../../../notes/proposed/process/2026-11-10-canonical-cli-guidance.md).
- [Documentation verification](../../../evidence/verify/2026-11-10-canonical-cli-guidance.md).
- [Application command invocation](../../../notes/implemented/feature/2026-11-05-application-command-invocation.md).

### Mainline and candidate boundary

- Mainline observed: `a9ed1962dc627aaddbc729394c4b41c616216966`.
- Candidate/source observed before this records commit: `7676f3d9682bf9486bbdb7ed0fbc8b0e8b637ab9`.
- [nodejs-sdk PR #27](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/27), OPEN and Draft at the recorded query; not merged.
- The unified source CLI is different from published CLI 0.5.10. This task does
  not issue npm/PyPI releases, deploy sites or certify changed templates.

Recent mainline changes, inspected from the refreshed Git history:

| Date | Commit | Change |
| --- | --- | --- |
| 2026-11-10 | [a9ed1962dc62](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/commit/a9ed1962dc627aaddbc729394c4b41c616216966) | docs: replace community QR image and join link (#26) |
| 2026-11-10 | [c953cd9d919f](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/commit/c953cd9d919f964ff11fa7df0a80476d9ca98c27) | docs: announce preview release schedule and developer community (#25) |

### Remaining delivery limits

Guidance depends on delivery of the unified CLI. Keep the coordinated PR Draft; source documentation does not establish npm publication or a new backend acceptance matrix.

## API Design

N/A — this decision does not involve API changes. Existing runtime, credential,
source identity and resource ownership contracts remain with their original owners.

## Alternatives considered

- A workspace-only summary cannot travel with an independent checkout.
- Copying all cross-repository reports duplicates authority and may expose private logs.
- Marking all proposed records implemented would confuse source work with accepted delivery.
- Combining unrelated local changes or permission-only differences in this commit
  would conceal the actual records scope.

## Dependencies

Existing owner records and GitHub PR/commit state. Coordinated implementation is
tracked in [CLI Issue #244](https://github.com/Alibaba-Agent-Sandbox/agent-sandbox/issues/244).
Each repository retains its own branch, record, verification and push.

## Test Strategy

Check the new record structure, relative links, pinned Git source revisions and
scoped diff; run the owner's applicable documentation/health checks. Query PR/CI
state separately from local checks. Do not run cloud tests solely to validate prose.

## Acceptance criteria

- Recent owner work is reachable from `.agents/README.md` with dated source references.
- Merged, Draft, failed, unrun and planned work remain distinguishable.
- Existing historical evidence and unrelated work remain intact.
- Documentation checks and remaining gates are recorded; scoped commits are pushed
  to task branches and remote branch hashes are independently compared.

## Evidence

- [Records verification](../../../evidence/verify/2026-11-10-recent-change-index.md).
