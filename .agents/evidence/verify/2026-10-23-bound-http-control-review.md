# HTTP binding control-character adversarial review

Date: 2026-10-23
Result: PASS (local scope)

Scope: raw/recursively encoded URL and operation validation in src/server-client.ts, two new regressions and associated documentation on the task branch after f67462b.
Environment: Node.js 22.22.2, existing locked installation, Python 3.11 with the current task server installed for the configured real-runtime tests.

The independent review found that WHATWG pathname assignment removes TAB/CR/LF before normalizing dot segments: a path containing TAB followed by two dots could escape a sandbox proxy prefix and carry its token/signature to another sandbox. Validation now runs before URL parsing/assignment, recursively rejects C0/DEL, dot traversal and encoded separators, and refuses recursively equivalent or duplicated gateway query keys.

- PASS: npm test, all 17 tests, including the actual Python runtime loop and real loopback gateway regression. Attack paths cause zero HTTP requests; the positive health request reaches only the owned sandbox with unchanged signature and expected application token.
- PASS: npm run typecheck.
- PASS: git diff --check.
- No cloud sandbox or external resource was created. Loopback servers and clients closed. This is local transport validation, not cloud acceptance or remote CI/review.

Refs https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/10 and https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/9. The earlier PR CI result does not cover this new head; rerun Node20/22 CI and complete independent review before merge.
