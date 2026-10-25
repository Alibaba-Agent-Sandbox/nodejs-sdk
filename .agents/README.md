# Node SDK engineering records

## Current delivery — 2026-10-24

- Source package version: **0.1.0**. [Source installation](../README.md#install) builds and packs the SDK. The recorded delivery is source merge, not npm publication.
- Scope: application HTTP `ServerClient` and configuration-name exports. No cloud lifecycle, template build, provider engine, PTY or interpreter client is exported.
- [Bound HTTP endpoint acceptance](evidence/verify/2026-10-23-bound-http-control-review.md) and [proxy-token acceptance](evidence/verify/2026-10-24-proxy-application-token.md) cover copied headers, preserved gateway URL/query, redirect refusal and no automatic credential retry.
- The proxy record includes the actual OpenSandbox python-hello Node calls. The 92-case template matrix used CLI/Python/HTTP and does **not** establish a 92-case Node SDK test.
- The [local runtime example](../examples/README.md) now installs the public Python server 0.4.0a1; its local health/process/file checks do not establish cloud lifecycle support.

[Documentation synchronization decision](notes/implemented/process/2026-10-24-current-docs-and-records.md) · [verification and acceptance reconciliation](evidence/verify/2026-10-24-current-docs-and-records.md).

Earlier entries below are a decision history. A remaining proposal is not a current product guarantee; read the linked acceptance scope before treating its full criteria as complete.


This repository owns decisions and verification for its HTTP client, public
configuration schema, ESM/TypeScript exports and examples. New records use English;
source contracts in other repositories are linked through absolute GitHub URLs.

Notes live in `notes/proposed/<architecture|feature|process>/YYYY-MM-DD-<topic>.md`.
Acceptance moves them to `notes/implemented/` with the same category and an updated
`Status:`. Rejected and superseded notes use flat state directories. A note has
Problem, Decision, API Design, Alternatives considered, Dependencies, Test Strategy
and Acceptance criteria sections.

Evidence lives in `evidence/verify/YYYY-MM-DD-<topic>.md` and records revision,
environment, actual commands/results, behavior, cleanup and unrun gates. Use PASS,
PARTIAL, BLOCKED or FAIL honestly. Merged evidence is immutable; add a new file for
a later run. Keep credentials, private data and raw sensitive logs out of records.

Include scoped records in the owning PR. Run applicable tests/build, inspect exact
latest-head required CI and independent review, and verify actual remote merge
state. A local/runtime result is not cloud acceptance or package publication.

- [Configuration reservations and installation](notes/implemented/process/2026-10-18-config-provider-reservations.md)
- [Verification](evidence/verify/2026-10-18-config-provider-reservations.md)

- [Portable source installation](notes/implemented/process/2026-10-18-portable-source-installation.md) · [verification](evidence/verify/2026-10-18-portable-source-installation.md)

- [Current configuration contract](notes/implemented/architecture/2026-10-22-remove-legacy-compatibility.md) · [verification](evidence/verify/2026-10-22-remove-legacy-compatibility.md)

- [Compatibility cleanup remote acceptance](evidence/verify/2026-10-22-remove-legacy-acceptance.md)

- [Bound HTTP client](notes/implemented/architecture/2026-10-23-bound-http-client.md) · [verification](evidence/verify/2026-10-23-bound-http-client.md)

- [HTTP binding control-character review](evidence/verify/2026-10-23-bound-http-control-review.md)

- [Proxy application token compatibility](notes/implemented/feature/2026-10-24-proxy-application-token.md) · [verification](evidence/verify/2026-10-24-proxy-application-token.md).

- [Fresh documented example rerun](notes/proposed/process/2026-10-25-example-rerun.md) · [verification](evidence/verify/2026-10-25-example-rerun.md).
