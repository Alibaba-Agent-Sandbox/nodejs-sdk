# Decision: Use the current public server in the Node example

Status: proposed

## Problem

The example and CI still select the previous Python runtime after the a2 release.
The example README also repeats historical source-path setup next to current use.

## Decision

Use exact public server 0.4.0a2 for installation and actual HTTP tests. Compare the
configuration schema against its matching immutable release tag. Keep historical
runtime receipts in their existing evidence files rather than installation steps.

## API Design

N/A — no Node exports, runtime behavior or package version change.

## Alternatives considered

Keeping an old server in CI would not validate the documented current runtime.
Replacing the HTTP client with cloud lifecycle functionality is outside its scope.

## Dependencies

https://github.com/Alibaba-Agent-Sandbox/python-sdk/releases/tag/v0.4.0a2

## Test Strategy

Run typecheck, all Node tests and the actual documented agent-loop example with
an installed public a2 runtime and no injected source path. Check schema parity.

## Acceptance criteria

Current setup, matching schema, tests and actual process/file/cleanup example pass;
normal latest-head CI and PR merge complete. This does not publish the Node package.

## Evidence

[Verification](../../../evidence/verify/2026-10-25-public-runtime-a2.md).
