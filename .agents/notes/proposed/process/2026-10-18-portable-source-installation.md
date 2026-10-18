# Decision: Provide a usable Node source package and portable runtime example
Status: proposed

## Problem

The public npm package returns404 while docs instruct its installation. The
example prepends fixed development-machine Python paths. No PR CI validates it.
https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/4

## Decision

Document locked source build/pack/consumer install in both languages. Preserve
caller PYTHONPATH and use an installed Python server. Add a real-runtime
regression and Node20/22 CI with an immutable server source. Clarify that exported
config names do not configure ServerClient or enable builtin retry policies.

## API Design

SDK exports, configuration JSON/names/defaults and package version are unchanged.
The example no longer prepends fixed paths; caller-controlled sources and
installed distributions are the supported resolution paths. No package publish.

## Alternatives considered

- Keep the npm command as presently available: public metadata returns404.
- Replace one fixed workspace root with another: remains environment-dependent.
- Test only mocked HTTP: omits the actual runtime/example and cleanup.

## Dependencies

Pinned Python server e86cb0be24e0083a27396b260298e7cf27b660d6:
https://github.com/Alibaba-Agent-Sandbox/python-sdk/pull/57.
Retry configuration contract:
https://github.com/Alibaba-Agent-Sandbox/python-sdk/issues/60.
Website installation guidance is independently maintained in
https://github.com/Alibaba-Agent-Sandbox/website/pull/2.

## Test Strategy

Regression fails before the fix by observing the actual spawned Python process
environment, then passes with real health/shell/files/cleanup. Run types/all
Node tests, npm pack and a fresh consumer import, workflow parse and docs links.
Hosted Node20/22 must pass; a local runtime test is not cloud provider proof.

## Acceptance criteria

- Documented source archive installs and imports in a fresh Node application.
- Explicit Python source configuration remains intact; actual example passes.
- Both CI versions run against the pinned real runtime without cloud secrets.
- Bilingual docs and accurate owner evidence accompany the change.
