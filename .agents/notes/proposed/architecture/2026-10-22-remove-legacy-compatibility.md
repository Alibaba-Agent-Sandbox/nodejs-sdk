# Decision: Export only current configuration names

Status: proposed

## Problem
The maintainer requests removing old project compatibility because the project has not formally released. The exported retry configuration fields do not drive an HTTP retry policy, and duplicate storage descriptors only represent former migration phases.

## Decision
Remove `max_retries` and `retry_base_delay` from the Python-owned configuration export. Synchronize the current export into this package. Replace `storage_phase1` and `storage_phase2` with one `storage` descriptor.

## API Design
`envName` rejects removed keys; `acceptsEnvName` rejects their environment names. `ConfigKey.storage` is the single persistent-location description. The HTTP client uses its existing current runtime behavior.

## Alternatives considered
- Retain inert names or deprecated storage properties: rejected by the maintainer's request.

## Dependencies
Canonical source: https://github.com/Alibaba-Agent-Sandbox/python-sdk/blob/main/client-sdk/src/agent_sandbox/utils/config_keys.py . The CLI consumes the same export at https://github.com/Alibaba-Agent-Sandbox/agent-sandbox . Land the shared configuration contract before consumers.

## Test Strategy
Run lockfile installation, type checking, all package tests and the local Python-server example. Assert removed names cannot be looked up.

## Acceptance criteria
- The Node export matches the current Python schema.
- Removed names are rejected, all local checks pass, and both README languages describe the current fields.
- Required remote CI and review pass before merge.

## Evidence
- [Verification](../../../evidence/verify/2026-10-22-remove-legacy-compatibility.md)

Issue: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/6
