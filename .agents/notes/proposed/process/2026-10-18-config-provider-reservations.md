# Decision: Synchronize the public configuration contract

Status: proposed

## Problem

The Node schema still reserves `e2b`, unlike the authoritative Python export where
it is an installable catalog id. Both README languages also give an immediate
public npm install command although current package metadata returns 404.

## Decision

Remove the stale id while preserving all built-in/core reservations, existing 23
keys, ESM types, env aliases and HTTP behavior. Document independent lockfile-based
source build and local-dependency installation in both languages. Add the missing
normal PR CI for Node 20/22, using Python 3.12.15 and a matching pinned server source.
No workflow existed before this change; the new checks are not historical gates.

## API Design

`configSchema.reserved_provider_ids` no longer includes `e2b`. No exported symbol,
configuration key or provider execution API is added. The public npm installation
command is described as applicable after publication; this change does not publish.

## Alternatives considered

- Keep the old id: preserves a contradictory public metadata contract.
- Change Python to match stale Node metadata: rejects an intentional catalog id.
- Claim source builds prove npm publication: contradicted by the registry result.
- Test only the source JSON: misses the built public export and real package use.

## Dependencies

- Schema: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/1
- Installation: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/2
- Authority: https://github.com/Alibaba-Agent-Sandbox/python-sdk/blob/145341d462df2f4753c03a62365114f1872acd1a/client-sdk/src/agent_sandbox/utils/config_keys.py
- CI source/server revision: `145341d462df2f4753c03a62365114f1872acd1a`.

## Test Strategy

Demonstrate the public-export regression against a built unchanged schema before
fixing it. Compare the complete JSON structure with the actual pinned Python
export. Execute lockfile install, typecheck, the full existing tests and actual
local server loop. Verify fresh consumer installation/import from the built local
checkout and packed artifact. Require exact-head Node 20/22 CI and independent
review before any authorized merge; no cloud or release is involved.

## Acceptance criteria

- Built public metadata matches the Python contract, leaving `e2b` unreserved.
- Existing built-in/core ids and all 23 keys remain unchanged.
- Regression fails before the fix; current unit/runtime/package checks pass.
- Both README languages disclose verified publication status and usable source setup.
- CI compares the complete source schema and runs existing real local behavior.
- Changelog and owner records are included; publication/merge evidence is not invented.

## Evidence

- [Verification](../../../evidence/verify/2026-10-18-config-provider-reservations.md)
