# Node SDK engineering records

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

- [Configuration reservations and installation](notes/proposed/process/2026-10-18-config-provider-reservations.md)
- [Verification](evidence/verify/2026-10-18-config-provider-reservations.md)

- [Portable source installation](notes/proposed/process/2026-10-18-portable-source-installation.md) · [verification](evidence/verify/2026-10-18-portable-source-installation.md)
