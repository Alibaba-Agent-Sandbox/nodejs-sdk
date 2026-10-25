# Decision: Select the verified public a3 server for the local example

Status: implemented

## Problem

Python client/server a3 is now public, while the current Node example and CI
select the preceding server and configuration-source release tag.

## Decision

Use exact public server 0.4.0a3 from official PyPI in the documented local setup
and CI. Compare configuration exports with matching immutable v0.4.0a3 sources.
Refresh current record navigation; keep earlier evidence as history.

## API Design

No Node export, runtime, package-version or publication change. The source package
remains 0.1.0 and is not published to npm by this task.

## Alternatives considered

Keeping an older runtime would not test current installation guidance. Adding a
new installer/framework or cloud lifecycle API is unrelated to this update.

## Dependencies

https://github.com/Alibaba-Agent-Sandbox/python-sdk/releases/tag/v0.4.0a3

## Test Strategy

Run lockfile installation, typecheck, 24 existing tests, the actual documented
local HTTP/process/file loop and package dry-run with public a3 and no PYTHONPATH.
Compare the full schema, inspect links/diff and wait for Node20/22 CI/review.

## Acceptance criteria

Documented current setup, complete schema and actual owned-process cleanup pass.
Required latest-head CI and independent review precede verified normal merge.
No cloud or npm publication claim is made.

[Verification](../../../evidence/verify/2026-10-25-current-public-server-a3.md).

Accepted by https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/18 at 2308aec369c60e451be0cc9f9c34e245a93a3104. Previous verification receipts retain their a3 scope.
