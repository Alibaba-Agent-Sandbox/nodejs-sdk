# Decision: Preserve application tokens through server proxies

Status: proposed

## Problem

ServerClient sends token as Bearer, while OpenSandbox server proxy strips Authorization. The existing application server also accepts X-Access-Token. A real [same-sandbox probe](https://github.com/Alibaba-Agent-Sandbox/awesome-providers/actions/runs/40109164062) isolated this difference.

## Decision

Keep Bearer and add the same explicit application token as X-Access-Token only if caller/gateway headers have not occupied that name. Match names case-insensitively and generate headers on a fresh copy per request. Preserve existing binding validation, redirect rejection and no retry.

## API Design

No new fields or methods. Existing token, headers and gatewayHeaders retain their roles. Supplied headers are not mutated, and no token means no synthesized application credential. This delivery changes source only, without starting a new npm publication process.

## Alternatives considered

Replacing Bearer would break existing services. Overwriting gateway credentials would mix audiences. A new provider option or protocol is unnecessary because the server already accepts both headers. Sending a second request after 401 would violate the no-replay behavior.

## Dependencies

Existing Python server authentication. Tracking: [Issue 11](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/11). Companion CLI fix: [Issue 140](https://github.com/Alibaba-Agent-Sandbox/agent-sandbox/issues/140).

## Test Strategy

Run owner typecheck/tests and real local server loop. Test Bearer-only and proxy-compatible HTTP authentication, gateway header case variants, caller immutability and missing tokens. Verify this exact source candidate against actual OpenSandbox proxy before merge.

## Acceptance criteria

Existing services and gateway headers remain compatible; the protected operation succeeds through the actual proxy and owned resources are cleaned up. No cloud creation API or npm publication is implied.

## Evidence

[Verification](../../../evidence/verify/2026-10-24-proxy-application-token.md).
