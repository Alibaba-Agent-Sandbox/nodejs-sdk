# Changelog

## [Unreleased]

### Fixed

- Preserve caller Python source configuration in the local runtime example; document usable source-package installation and validate real runtime behavior on Node20/22 CI. Clarify configuration-name exports and retry compatibility.

### Fixed

- Match the Python configuration schema by leaving the installable `e2b` catalog
  provider id unreserved while preserving all built-in/core reservations.
- Explain the current source-checkout installation path in English and Chinese;
  public npm package metadata returns 404 until publication.

### Added

- A PR CI matrix for Node.js 20/22, including the existing real local server loop
  against a pinned Python server source. No publication workflow is added.
