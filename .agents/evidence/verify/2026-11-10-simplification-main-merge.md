# Canonical CLI documentation mainline merge — 2026-11-10

Scope: https://github.com/Alibaba-Agent-Sandbox/nodejs-sdk/pull/27 .

Merge fixed main `a9ed1962dc627aaddbc729394c4b41c616216966` into the published simplification branch without rebase or force-push. Main added only the preview/community announcement and QR replacement. A read-only merge-tree review found no conflicts, and parent review approved preserving both mainline community content and the current CLI guidance. Node package code, dependencies and HTTP client exports are unchanged.

## Verification

- Both README announcement/community lines match fixed upstream.
- QR image and four upstream engineering records match upstream bytes.
- Seven merged Markdown files checked for local file links; no missing targets. Remote URLs and anchor fragments were not checked.
- Git diff whitespace check passed. The canonical CLI note, CHANGELOG entry and existing guidance remain retained.
- No new Node runtime or cloud test was run for this documentation-only merge. The prior PR checks remain historical; remote CI must rerun on this merge commit.

No package version, release state, credential policy or provider qualification changed.
