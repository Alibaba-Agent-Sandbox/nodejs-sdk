# Verification: Application command invocation

- Date: 2026-11-05
- Change: application-command-invocation; owner Issue https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/23
- Result: PASS for application HTTP scope; latest-head delivery checks remain required
- Baseline: 1505b61a10a819c299c25f31ba508af2d8cb4ba6
- Environment: Node 22.22.2, Python 3.11.15, matching local Python client/server source. No cloud credentials are required or passed to these tests.

## What was verified

Registered application commands preserve typed JSON arguments and separate request timeouts. Requests retain the bound proxy prefix, signed query and distinct application/traffic headers. The actual local Python runtime discovers and executes a registered function with business fields named timeout, name, arguments, server_port and requestTimeout, and returns expected validation/not-found errors.

## Commands run

`npm run build && node --test --test-name-pattern='named application commands' test/server-client.test.mjs` first failed all three new behavior tests because the API was absent. After implementation all three passed.

`npm ci --ignore-scripts --no-audit --no-fund`, `npm run typecheck`, `node examples/agent-loop.mjs` and `npm pack --dry-run` passed. `npm test`, with the matched Python environment on the child process PATH, passed all 36 tests, including the real registered-command service and both existing agent-loop tests. An intermediate configuration test failed because its old expected key count was 21; the synchronized schema adds security_token as key 22, and the complete canonical-name and secret-key checks now pass.

A further observable regression first failed when a response sent headers but delayed its JSON body: timeout escaped as DOMException instead of ConnectionError, and controllers were released too early to support client-close cancellation during body reads. The request lifetime now includes body consumption. Timeout, close, server errors and no-replay checks pass in the full run.

## Independent review

A separate SDK reviewer inspected the complete diff and reran all 36 tests successfully. The reviewer found fractional request seconds could reach AbortSignal.timeout as a non-integer and throw RangeError before cleanup. Timeout conversion now rounds up to whole milliseconds, rejects unsupported timer ranges before I/O, and constructs cancellation signals inside the controller lifetime. A fractional 0.0105-second regression and an oversized-value rejection pass in the complete 36-test run. No remaining blocking issue was found in metadata, URL/query binding, argument separation or authentication.

## Cleanup

The registered-command Python process exited on SIGTERM; its temporary source/data directory was removed. Existing agent-loop fixtures also cleaned up. No cloud resource was created.

## Not verified

The initial implementation head 0b0367e34b03fffdc672e20adb5125bab757e3e6 passed the complete Node20/22 matrix in [run 41992843654](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/actions/runs/41992843654). CI now pins the companion reviewed product commit 653404d4eb1e61c490816e1c8f7b688664b146e1, which includes the shared configuration export; that contract must land before this consumer merges. Independent review is complete. The final follow-up head must pass its own remote checks. This does not certify cloud lifecycle or npm publication.

## Real private application acceptance

The candidate was also exercised against an owned Express sandbox hosting a registered function on an exclusive port. Node command discovery and invocation passed with separate public-gateway and application credentials; conflicting business argument names were preserved. The independent Python/direct-HTTP controls passed and anonymous public traffic returned HTTP403. Deletion was confirmed independently with GET404 and zero owned resources remaining.

An earlier Node controller failed TLS trust with UNABLE_TO_VERIFY_LEAF_SIGNATURE because its minimal child environment dropped already-configured NODE_EXTRA_CA_CERTS/SSL_CERT_FILE. Raw fetch reproduced the same failure. Preserving only the existing trust configuration fixed the controller; certificate verification was never disabled. A separate early object-order comparison was replaced with deep value equality. These controller failures remain distinct from product behavior.
