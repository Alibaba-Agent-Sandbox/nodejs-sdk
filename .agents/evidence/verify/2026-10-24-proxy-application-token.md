# Verification: Node SDK application tokens through server proxies

- Date: 2026-10-24
- Result: PARTIAL
- Change: [Issue 11](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/11)
- Source: fix/application-token-proxy, package source version 0.1.0.

## Executed

- npm ci, npm run typecheck and npm run build passed.
- node --test test/server-client.test.mjs: 16 passed, including real local HTTP Bearer-only and proxy-compatible services, gateway header case variants and copied header immutability.

- Initial full npm test: 22 passed, 2 failed because the shell had no installed Python server. The complete suite is being rerun with an isolated installed runtime; no test is weakened.

## Pending

Complete owner tests with the actual Python runtime, final remote Node20/22 CI and the exact candidate Node consumer against actual OpenSandbox proxy. The earlier upstream probe proves the header diagnosis, not this implementation. No npm publication is authorized or claimed.
