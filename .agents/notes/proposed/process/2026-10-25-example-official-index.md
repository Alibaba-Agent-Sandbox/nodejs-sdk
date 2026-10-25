# Decision: Select official PyPI for the example runtime

Status: proposed

## Problem

The shared English/Chinese example setup pins public server 0.4.0a2 but lets a
configured mirror choose its index. A stale mirror can lack this published alpha.
The existing CI already selects the official index explicitly.

## Decision

Add `--index-url https://pypi.org/simple` to the existing installation command.
Keep one shared command for both languages and the exact published runtime pin.

## API Design

No API, source export, package version or runtime change.

## Alternatives considered

A mirror fallback or source installation would add paths readers do not need.
Changing global pip configuration would exceed this example's scope.

## Dependencies

[Public Python runtime a2](https://github.com/Alibaba-Agent-Sandbox/python-sdk/releases/tag/v0.4.0a2).

## Test Strategy

Install the documented server in a new Python environment using the explicit
index, check dependencies, then run the existing Node checks and actual local loop
without PYTHONPATH. Review links and the exact diff; wait for latest-head CI/review.

## Acceptance criteria

The documented installation and real local HTTP/command/file/process cleanup pass.
Existing Node checks and normal PR gates pass. No npm publication is implied.

[Verification](../../../evidence/verify/2026-10-25-example-official-index.md).
