# Decision: Invoke registered application commands with separate arguments

Status: implemented

## Problem

The application HTTP client supports shell and file operations but omits the server's registered function API. Mixing function arguments with request options would reserve normal business names such as timeout. The current shared configuration export also lacks the STS session-token key being added by its Python owner.

## Decision

Add ServerCommandsApi to ServerClient with explicit list and invoke methods. Reuse the existing bound HTTP transport, separate gateway/application authentication, redirect refusal and non-replayed mutation behavior. Preserve the package's application HTTP scope. Import the updated configuration export without aliases or an independent configuration registry.

## API Design

`commands.list(): Promise<ServerCommand[]>` reads GET /commands. `commands.invoke<T>(name, arguments, { requestTimeout }): Promise<T>` sends the argument object to POST /commands/{name}; HTTP timeout is in seconds and is never added to the business object. Metadata types and ServerCommandsApi are public exports. Runtime protocol validation checks metadata and the result envelope, while callers validate their own business result type.

## Alternatives considered

- Merge transport fields into business arguments: rejected because names collide.
- Add a Node cloud lifecycle SDK: rejected because it exceeds this package's existing scope and duplicates provider mappings.
- Call arbitrary paths or follow redirects: rejected because it breaks the authenticated endpoint binding.

## Dependencies

The existing Python server command protocol and its Python-owned configuration schema. Companion contract: https://github.com/Alibaba-Agent-Sandbox/python-sdk/issues/152 . Owner issue: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/23 .

## Test Strategy

Regression-first HTTP tests cover typed arguments, gateway binding, status preservation, no mutation replay and malformed responses. A real local Python server registers a function with conflicting business names and verifies discovery, invocation and rejected calls. Run typecheck, the complete Node suite, the example and package checks; compare the whole configuration schema against the exact companion source commit in CI.

## Acceptance criteria

- Conflicting business argument names are preserved unchanged.
- Existing authentication and bound endpoint protections remain effective.
- Real registered function invocation and the existing local example pass.
- Full required local/remote checks and independent review pass before merge.
- English/Chinese usage, public exports, shared configuration and evidence are consistent.

## Evidence

- [Verification](../../../evidence/verify/2026-11-05-application-command-invocation.md).
