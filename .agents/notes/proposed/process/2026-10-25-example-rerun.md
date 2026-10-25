# Decision: Verify the documented Node example with the current public runtime

Status: proposed

## Problem
The maintainer requested every existing example be rerun from its installation instructions. The runtime pin lagged the public Python pair. An initial stale-workspace path report was corrected after inspecting current main.
## Decision
Keep the existing portable example, install the public Python server and document the new executed result.
## API Design
N/A — no API changes.
## Alternatives considered
Do not claim npm publication or cloud lifecycle based on a source-build local example.
## Dependencies
Public Python server 0.4.0a1 and the documented Node lockfile build.
## Test Strategy
Fresh Python installation, npm ci, build, example, typecheck and the configured Node test suite.
## Acceptance criteria
Exact process output/file bytes and owned process termination pass; bilingual installation instructions and evidence are present.

Refs https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/14
