# Decision: Use the corrected public Python a4 help contract

Status: implemented

## Problem

Python a3 help still documents retired provider arguments. A lockstep a4 patch
corrects help without changing executable provider behavior. Maintained Node
example installation and schema comparison should use the resulting public pair.

## Decision

Prepare the existing server installation and CI schema source for exact a4.
Promote this guidance only after official publication and independent fresh
installation, existing Node tests and actual local HTTP/process/file verification.
Keep previous a3 receipts unchanged.

## API Design

No Node runtime, exported interface or package-version change. The SDK remains
a source package at 0.1.0; no npm publication is implied.

## Alternatives considered

Adding aliases, a new installer or cloud lifecycle API is unrelated. Rewriting
prior installation evidence would incorrectly change its tested version.

## Dependencies

https://github.com/Alibaba-Agent-Sandbox/python-sdk/pull/125

https://github.com/Alibaba-Agent-Sandbox/python-sdk/releases/tag/v0.4.0a4

## Test Strategy

After actual public a4 readback, run lockfile installation, typecheck, all 24
existing tests, the documented local example, package dry-run and complete schema
comparison against installed Python. Verify the owned server exits. Wait for
latest-head Node20/22 CI and independent review before normal merge.

## Acceptance criteria

Public a4 installation, complete schema and local runtime checks pass; required
CI/review and normal merge pass. No cloud or npm publication claim.

## Evidence

[Verification](../../../evidence/verify/2026-10-25-public-runtime-a4.md).
