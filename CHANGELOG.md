# Changelog

## [Unreleased]

### Tests

- Consume common application authentication vectors without adding SDK setup commands or changing public exports.


### Documentation

- Document the named CLI deployment workflow and keep the Node SDK focused on explicit application HTTP endpoints. / 文档对齐具名部署命令，Node SDK 继续使用明确的应用 HTTP 地址。

- Select the verified public Python a4 runtime and matching configuration-source tag; preserve prior a3 verification as history. / 本地示例与配置对照统一公开 Python a4，保留原 a3 验证记录。

- Select verified public Python server 0.4.0a3 in the local example and CI, with its matching configuration-schema release tag.

- Use the official PyPI index for the local example's exact public server 0.4.0a2 installation, matching CI.

- Verify the documented local agent-loop example with public Python runtime 0.4.0a1 and refresh its installation pin.

### Removed

- Retired retry configuration exports and duplicate migration-phase storage descriptors; use the current Python-owned configuration schema.

### Fixed

- Keep request timeout and client-close cancellation active while reading an application response body. / 读取应用响应体期间继续执行超时和客户端关闭取消。

- Reject control characters before URL normalization and recursively encoded namespace escapes/query-key collisions before an authenticated request can reach another sandbox.

- Preserve sandbox proxy prefixes and signed query bytes; reject redirects, URL userinfo, escaping paths and credential/header collisions. Separate gateway headers from the application token and omit signed query credentials from diagnostics.

- Preserve caller Python source configuration in the local runtime example; document usable source-package installation and validate real runtime behavior on Node20/22 CI. Clarify configuration-name exports and retry compatibility.
- Match the Python configuration schema by leaving the installable `e2b` catalog
  provider id unreserved while preserving all built-in/core reservations.
- Explain the current source-checkout installation path in English and Chinese;
  public npm package metadata returns 404 until publication.

### Added

- Discover and invoke registered application commands with separate business arguments and HTTP request options. / 支持发现和调用已注册应用命令，业务参数与 HTTP 请求选项分开。
- Export the shared `security_token` configuration name (`ALIBABA_CLOUD_SECURITY_TOKEN`) for STS credentials. / 导出 STS 凭据的共享配置名 `security_token`。

- A PR CI matrix for Node.js 20/22, including the existing real local server loop
  against a pinned Python server source. No publication workflow is added.
