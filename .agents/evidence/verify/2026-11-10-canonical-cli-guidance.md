# Canonical CLI guidance verification — 2026-11-10

Result: PARTIAL — scoped documentation checks complete; coordinated CLI merge and
latest-head remote CI are separate gates.

Scope: The HTTP client already had no obsolete CLI aliases. Both READMEs now explain how current deploy/status/delete commands provide the endpoint for explicit ServerClient construction. Local deployment names are not URLs or Sandbox IDs; no cloud lifecycle API was added.

## Checks

- Read owning repository contributor, engineering-record and workflow instructions.
- Compared command examples with current CLI source command registration and deployment
  handlers: deploy/list/status/logs/delete/recover, template authoring, sandbox command
  invocation and provider operations remain separate.
- Changed-Markdown local link check compares missing links with HEAD; no introduced
  missing local targets. Historical records and archive examples are not rewritten.
- No runtime code, dependency or examples were changed; runtime tests are not required for this documentation-only scope under the repository instructions.

## Limits and cleanup

No release, backend operation, cloud credential use or cloud resource creation was
performed. No implementation or maturity claim follows from these documentation
checks. This repository's PR must link the CLI coordination change and wait for its
actual final command contract. Temporary local test logs remain outside the repository.

## Final documentation check

- Changed Markdown local-link audit: 6 files checked, no introduced missing file links. URL anchors and remote pages were not fetched.
- Current CLI examples use named deploy/status/delete, sandbox operations and Provider run with JSON input. Historical archived documents remain historical.
- CHANGELOG updated; no version bump or package publication.
