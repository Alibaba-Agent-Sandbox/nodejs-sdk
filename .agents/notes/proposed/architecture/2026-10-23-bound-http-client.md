# Decision: Bind HTTP requests to one application endpoint

Status: proposed

## Problem
Resolving relative operations against a signed gateway URL discarded its query and could misplace the proxy prefix. Default fetch redirects could send application credentials to a different sandbox. Diagnostics and object inspection exposed URL query credentials.

## Decision
Preserve the complete prefix and exact original query bytes, append only new parameters and reject parameter replacement. Refuse every redirect, URL userinfo, fragments, non-HTTP URLs, prefix escapes and authority/transport header overrides. Keep the private endpoint separate from the query-free public baseUrl. Separate gatewayHeaders from the application's token and other headers; reject name collisions instead of silently replacing credentials.

Validation runs on raw base URLs and operation paths before WHATWG URL parsing or pathname assignment. Bounded recursive decoding rejects C0/DEL, encoded separators and traversal at every layer; query keys cannot collide after recursive decoding. This prevents URL normalization from silently moving a credential-bearing request into another sandbox.

## API Design
ServerClientOptions adds gatewayHeaders. token remains the application's bearer token. baseUrl reports the query-free origin and path. Failed connections omit underlying error text that may contain signed URLs. The HTTP-only public SDK scope remains unchanged. Per-operation signed paths require the provider's operation resolver; this prefix client does not infer such signatures.

## Alternatives considered
Origin-only redirect restrictions still allow credentials to reach another sandbox on a shared gateway. Reconstructing all query parameters changes signature bytes. Silent authentication retries or token precedence obscure credential ownership.

## Dependencies
The in-sandbox HTTP server is owned by https://github.com/Alibaba-Agent-Sandbox/python-sdk. The project workflow design is tracked in https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/issues/9.

## Test Strategy
Use real loopback HTTP servers to check wire paths/query bytes, credential separation and single-request redirect refusal. Reject malformed endpoints, path traversal, overlapping headers and query replacement before I/O. Run the full configured suite, typecheck, package validation and actual local Python server example.

## Acceptance criteria
All configured Node tests and type checks pass. Proxy paths and signature bytes survive each operation. Redirects and authority overrides cannot move credentials. No cloud or interpreter API is introduced; verification distinguishes local runtime behavior from cloud acceptance.
