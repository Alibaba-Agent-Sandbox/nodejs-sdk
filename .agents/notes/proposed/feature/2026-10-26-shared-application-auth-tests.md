# Decision: Verify the common application authentication contract

Status: proposed

## Problem

The Node HTTP client, Python client and CLI had separately maintained authentication examples. CLI onboarding improvements should not add commands or configuration responsibilities to this library.

## Decision

Consume the Python-owned authentication test vectors and run them against ServerClient.authHeaders. Keep runtime implementation and public exports unchanged. Retain independent SDK installation.

## API Design

N/A — additive test fixtures only; constructor-based authentication remains unchanged.

## Alternatives considered

- Import the CLI implementation: unnecessary package coupling.
- Add interactive SDK configuration: outside the library's scope.

## Dependencies

Canonical source: https://github.com/Alibaba-Agent-Sandbox/python-sdk. Related CLI work: https://github.com/Alibaba-Agent-Sandbox/agent-sandbox/issues/189.

## Test Strategy

Run npm ci, typecheck, all Node tests and the real local Python server example. Verify fixture bytes against the pinned owner source in CI.

## Acceptance criteria

- Common authentication cases pass without changing gateway/application credential separation.
- SDK setup remains noninteractive and no lifecycle capability is added.
- Tests, source pin, owner evidence and required CI/review pass.

## Evidence

- [Verification](../../../evidence/verify/2026-10-26-shared-application-auth-tests.md).
