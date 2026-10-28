# Verification: nodejs-sdk README audience review

- Date: 2026-10-28
- Result: PASS — scoped local documentation verification. Remote checks and merge are reported separately on the PR.
- Base revision: `129e3d6e0629637f95abafaff1f146d741ba4d46`.
- Scope: `README.md`, `README.zh-CN.md`, `docs/configuration.md`, `docs/configuration.zh-CN.md`, `docs/server-client.md`, `docs/server-client.zh-CN.md`; repository-owned note and this evidence.
- Environment: Linux, Node.js 22.22.2, system Python 3.13.13; SDK/server and checker environment Python 3.11.15.

## What was reviewed

The opening called the SDK a first slice, repeated exclusions and described transport requests before a useful example. A full configuration table and long gateway-validation narrative dominated the README; dated publication checks appeared as installation prose.

Describe the HTTP client scope and actual source installation. Provide one complete service example and an operation table. Keep application-versus-gateway authentication and sandbox cleanup visible. Move complete HTTP/authentication and configuration tables into bilingual docs/server-client and docs/configuration references without changing their contract.

## Validation

`python "$README_AUDIT"` passed for 9 changed Markdown files, with zero failures. This temporary audit used the existing template repository's Markdown-target/heading parser at its checked-out base revision and a task wrapper (SHA-256 `fe8c34fd4ef2474ca7dfcfcc94d2a055e9ead01a92fe2695446cfe08341df7e6`). It checks changed local targets/fragments, incoming active README heading links, one H1 and reciprocal language links in each root README, balanced fences and Python snippet syntax. `README_AUDIT` denotes that temporary wrapper; no machine-local path is part of the repository. It does not validate cloud runtime behavior.

`git -c core.filemode=false diff --check HEAD` passed. The filesystem exposes executable bits on unchanged checkout files; ignoring those bits for task-local Git commands avoided including unrelated mode changes. The staged change was reviewed for prose-only scope, translation equivalence, current command/API names and preserved license links. Package registry checks on 2026-10-28 found CLI 0.5.8 and Python client 0.4.0a6; the Node SDK public npm metadata endpoint returned HTTP 404. No new package publication is claimed.

## Limits and cleanup

Documentation changes only. No provider API calls, sandboxes, templates, cloud keys, model calls, deployments or package releases were created by local verification. Existing historical receipts remain unchanged. CI and existing main-branch publication workflows retain their own scope.

## Repository checks

- `npm ci`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: FAIL initially: the selected system Python did not have agent-sandbox-server installed; two agent-loop tests failed with ModuleNotFoundError, 27 passed.
- `npm test (PATH selects the fresh SDK/server Python environment)`: PASS: 29 tests, 0 failures.

## Reviewed public-file identity

| File | SHA-256 |
| --- | --- |
| `README.md` | `c5304f6b61386eccf92a80c7c22d230b35703af0fa2835e46fade0628edf7789` |
| `README.zh-CN.md` | `c9171a4acfecb3a9f5396c4d3337cc2466906764ba8a0720d7cdcdf525f41c76` |
| `docs/configuration.md` | `07641c746f73d1e76847241bb60937047436d7c0cb1c01e7a9333316fd43c7f0` |
| `docs/configuration.zh-CN.md` | `afedef81ae470fdef04dc92f3edb04ab129561dd15a1b50b54c8cb5dae270a4b` |
| `docs/server-client.md` | `ce82809b5490106ae3109f109d5fe59d278357e27660de90ede280c44e30258d` |
| `docs/server-client.zh-CN.md` | `fbcba6e84b66947238986f887a5d9b962b9a452035172061b1e60d7464d2f772` |
