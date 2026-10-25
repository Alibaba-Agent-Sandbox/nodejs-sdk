# Decision: Follow the public standard-template help correction

Status: proposed

## Problem

Python a5 corrected Template help but retained four ordinary Sandbox and
interpreter help imports using upstream package names. The a6 correction changes
these help imports and removes inaccurate current design examples.
The coordinated Node example/server installation should follow the resulting
verified public pair without implying a new Node implementation or publication.

## Decision

Prepare exact a6 server installation and Python schema source. Promote only
after official publication, fresh installation and actual local verification.
Accept the preceding a4 note using PR19's normal merge and actual CI acceptance;
keep its dated evidence unchanged.

## API Design

No Node runtime, package version, dependency range or public contract changes.
Source package remains 0.1.0; no npm publication is implied.

## Alternatives considered

Adding upstream dependencies or compatibility aliases is unrelated. Rewriting
a4 evidence would obscure its actual tested version.

## Dependencies

https://github.com/Alibaba-Agent-Sandbox/python-sdk/issues/130

https://github.com/Alibaba-Agent-Sandbox/python-sdk/pull/131

https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/19

## Test Strategy

After publication, use the ordinary official Python package with matching
server. Run npm ci, typecheck, all 24 tests, the unchanged actual local example,
complete schema comparison and package dry-run. Independently confirm owned
process exit. Require latest-head Node20/22 CI and independent review.

## Acceptance criteria

Public package readback, local checks, CI/review, normal merge and actual remote
state are verified. Cloud lifecycle and full template coverage remain separate.

## Evidence

[Verification](../../../evidence/verify/2026-10-25-public-runtime-a6.md).
