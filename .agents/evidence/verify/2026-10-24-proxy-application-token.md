# Verification: Node SDK application tokens through server proxies

- Date: 2026-10-24
- Result: PASS
- Change: [Issue 11](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/11)
- Source: fix/application-token-proxy, package source version 0.1.0.

## Executed

- npm ci, npm run typecheck and npm run build passed.
- node --test test/server-client.test.mjs: 16 passed, including real local HTTP Bearer-only and proxy-compatible services, gateway header case variants and copied header immutability.

- Initial full npm test: 22 passed, 2 failed because the shell had no installed Python server. No test was weakened. A subsequent isolated environment installed published agent-sandbox-server==0.3.1a3 and websockets; the complete npm test rerun passed all 24 tests with no skips.

- With the same isolated runtime, node examples/agent-loop.mjs passed health, shell result 4, file roundtrip and process cleanup. npm pack --dry-run passed.
- Complete remote Node 20/22 [CI 40110191447](https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/actions/runs/40110191447) passed, including actual Python runtime loop, configuration schema parity and package checks.
- Delivery is source merge only. No first npm publication is authorized or claimed.

## Actual OpenSandbox regression

[Run 40110372103](https://github.com/Alibaba-Agent-Sandbox/awesome-providers/actions/runs/40110372103) passed using these exact sources:

| Repository | Revision |
| --- | --- |
| awesome-providers | `65d8e5a9c130f424c05a662fe430b0eb04793c0e` |
| agent-sandbox | `80c45cd2594d0fc997badfd31246d60ffa434de5` |
| python-sdk | `588d126af9310ee5536ea631856b092b84c6ce6b` |
| nodejs-sdk | `344d297df816063b6580d7f2bb34180111ad9a54` |
| awesome-templates | `295aff8f45f710eadf46d164b7ce4150b2c914ec` |

The python-hello template completed default/direct, portable/direct and default/proxy project launches and actual CLI/Python application calls. The independent Node client called the protected command through the proxy twice. Raw direct Bearer/proxy Bearer/proxy X-Access-Token probes retained the expected 200/401/200 distinction; successful requests asserted the application result. Independent Docker resource readback confirmed cleanup.

This covers one template and the stated launch paths against the pinned single-tenant OpenSandbox server. It does not certify all 46 templates, every gateway credential combination or multi-tenant server configuration. Existing gateway X-Access-Token values remain authoritative and are never replaced.

## Review and delivery boundary

Independent cross-agent review found no blocker in copied header assembly, case-insensitive gateway preservation, Bearer compatibility, anonymous requests, redirect rejection or no-retry behavior. Final evidence-only commit CI remains a merge gate. This record does not claim package publication.
