# Verification: portable Node source installation

- Date:2026-10-18
- Result:PARTIAL; local actual-runtime/types/package/docs PASS; hosted gates pending.
- Base:9048f3b; SDK version0.1.0, Node22.22.2.

Public npm metadata for @agent-sandbox/sdk returned404. New actual-runtime
regression before the fix:1 FAIL; child PYTHONPATH was prefixed with two fixed
workspace paths instead of preserving the explicit caller value. The original
real server loop otherwise completed; temporary wrapper/record were cleaned.
Fixed source now uses installed/runtime caller configuration with no new option.
After fix:npm ci/typecheck PASS; npm test10 PASS,zero failed/skipped, including
both actual Python HTTP/shell/file/process-cleanup scenarios. npm pack produced
agent-sandbox-sdk-0.1.0.tgz with22 files, built ESM/declarations/config JSON and
license/notices. Fresh application local-archive install and public imports PASS.
Changed Markdown local links/ADR format and workflow parse PASS. Configuration
JSON/client implementation unchanged. Hosted Node20/22 CI remains required.
No public package publication or cloud provider acceptance is claimed.

Final diff review retained the existing full Python/Node configuration-schema
comparison in the workflow (not only HTTP/runtime tests). The accepted immutable
Python revision exports a byte-equivalent parsed JSON table locally. The
intermediate workflow omission is corrected before merge; no gate is weakened.
