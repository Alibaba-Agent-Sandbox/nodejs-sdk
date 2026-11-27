# Decision: Deliver the Node Client SDK, Server SDK, and reusable Provider runtime
Status: proposed

## Problem

The current Node repository describes an HTTP client and exported configuration names. The reviewed target requires a complete Node Client SDK, a Node Server SDK, and reusable runtime modules that the CLI can consume directly. A Python application using a Node-only Provider must also be able to use a small internal host without installing or starting `abx`.

This is an explicit target-scope expansion, not a statement that the existing package already implements cloud resources, Server SDK registration, helper installation, or the internal host. The design has undergone review; implementation, packaging, real acceptance, and release remain pending. Contributor guidance, public exports, and both README languages must reflect each delivered stage accurately.

## Decision

This repository owns the Node runtime implementation used by Node applications and the CLI, the native Express Provider implementation, the Node Server SDK, the Provider loader/internal host, and reusable source-preparation modules. Move the reusable Express runtime responsibility out of CLI-only consumers into this Node core; the CLI consumes it. Installable catalog Providers remain in their owning repository, and this plan does not require moving built-in Express into the Provider catalog. Keep command parsing, prompts, CLI configuration and deployment orchestration in the CLI repository. Node runtime modules and their package dependencies must not import the CLI or invoke its executable.

| Task ID | Scope | Deliverable | Depends on |
| --- | --- | --- | --- |
| NJS-01 | Neutral contract consumption and typed exports | Node validators/types and conformance tests consuming the Python-owned neutral runtime contract revision; explicit package/module boundaries for Client, Server, and internal runtime functions. | Python neutral contracts and fixtures |
| NJS-02 | Express implementation, Provider loader, and internal host | Native Express implementation for Node SDK/CLI consumers, programmatic catalog Provider loading, bound implementation lifetime, and a minimal versioned host usable by Python's Node-only branch; supported platform artifacts with complete runtime dependencies. | NJS-01; actual catalog Provider implementations where selected |
| NJS-03 | Node Client SDK | Provider resource operations, distinct create/get/connect, private access preservation, HTTP/OpenAPI/named-command consumption, built-in E2B helper, local helper factories, and file/stream/cancellation/cleanup behavior. CLI data calls reuse these modules. | NJS-01; NJS-02 |
| NJS-04 | Node Server SDK | Explicit runtime-schema registration, serving, policy enforcement, export/discovery from one registration source, and static `ApplicationSource` generation compatible with both Client languages and CLI preparation. | NJS-01; agreed application and authentication contracts |
| NJS-05 | Source preparation, SDK installer, and MCP | Reusable fixed-source resolution/preparation for Providers and helpers; SDK-owned Node project preparation; portable dependency records; same-language MCP adapters using the Client/helper implementation. | NJS-01; NJS-03; template/Registry source metadata |
| NJS-06 | Integration and release qualification | CLI consumption checks, Python-host artifact checks, real Node/Python HTTP interoperability, accurate English/Chinese guides and examples, changelog, and repository-owned verification evidence. | Relevant NJS tasks and actual cross-repository artifacts |

These are responsibilities within this repository; they do not require a separate public product or a package for every internal module. Select package boundaries through the normal dependency and packaging review. Do not invent release coordinates or claim a supported platform until its artifact and dependency closure have been tested.

## API Design

Implement the reviewed target signatures and the Python-owned neutral contract fields. This ADR assigns responsibilities and acceptance; it does not define an alternative schema or copy the unified design.

- `ProviderClient` exposes Promise/AsyncIterable APIs and fixes the selected Provider implementation, endpoint, account/Team, region, and credential sources. Local target references do not prove existence. `get` remains read-only; explicit `connect` declares possible resume/expiry effects; `create` submits once. Application calls never fall back to creating, connecting, switching Providers, or changing protocols.
- Provider loading is a runtime library function with explicit inputs. Static help and metadata consumption do not import plugin code. Factories initialize local bindings and defer actual network work to calls. Running Clients retain the selected implementation across updates, endpoint resolution, and cleanup.
- The internal host carries the agreed operation completion and private access data without routing ordinary business HTTP through the CLI or host. Preserve byte-oriented file/PTY behavior, bounded buffering, cancellation, unique terminal outcomes, and known partial results. Host loss terminates affected requests explicitly; unknown submitted writes are not automatically replayed. Killing one request must not destroy a shared host used by other requests.
- Node's public result projection must preserve usable private create/connect material in the owning Client while excluding credentials from ordinary serialization. Native and hosted paths must convey identical identity, access, failure, and cleanup semantics. A result-schema error cannot erase a real resource that was already created.
- Styles select an existing protocol or explicitly installed local helper. Ship the E2B helper with the Node Client SDK; do not automatically select it for every instance. Application code supplies a default or explicit factory. CLI template preferences are interpreted by the CLI, never implicitly read by Node SDK applications.
- The Node Server SDK accepts explicit input/output schemas and registers handlers once. Routes, named-command behavior, exported OpenAPI, discovery, and static application descriptions derive from that registration. Export does not run business handlers. Client-side static imports do not execute server modules.
- Authorized application preparation consumes `ApplicationSource` with its declared startup, readiness, authentication, and known artifact relationship. Native platform startup and client runner startup cannot both be selected. Services explicitly choosing platform ingress add no application credential; default application mode uses the agreed real-ID MD5 rule; custom and external Serving authentication retain their actual contracts. Missing information or failed authentication does not trigger anonymous retries.
- Source preparation resolves local/template source, fixed Git, and optional package sources only during explicit installation. The Node SDK's preparation entry writes normal project dependencies and a lockfile; the CLI uses the same preparation modules with its own managed dependency destination. Neither installation destination changes the other. Runtime calls never install, update, or activate packages.
- Node MCP adapters project a fixed operation contract onto the same handlers. They retain access handles per session, enforce configured file roots in the MCP process, preserve owned/borrowed resource distinctions, and report recoverable cleanup failures. Tools cannot supply a different Provider, helper source, or credential target.

A Node application must be able to install its dependencies, import a chosen factory/static description, create or explicitly connect, perform the same business operation used by the CLI, and close or delete according to ownership. This chain must work when no CLI package or CLI configuration exists.

After a high-level create with application preparation has obtained a new instance ID, preparation failure or cancellation must trigger a bounded independent cleanup attempt for that owned instance. `ApplicationPreparationError` retains the real ID, failed phase, original cause (including cancellation), and cleanup outcome (`deleted`, `failed`, or `unknown`) plus any cleanup cause. Accepted deletion without completion confirmation is `unknown`. Unknown creation without an ID is neither replayed nor assigned a guessed deletion target. This closing-stage wait is bounded separately from the original call; ordinary Client close never substitutes for remote deletion.

## Alternatives considered

- **Keep Node as an HTTP-only facade while adding target behavior to the CLI.** Rejected because the target explicitly includes Node Client and Server SDKs, and the CLI must reuse a library rather than own the runtime business implementation.
- **Make the SDK import CLI modules or run `abx` as its engine.** Rejected because it creates a reverse dependency, brings command/configuration side effects into applications, and prevents independent Python use of Node-only Providers.
- **Expose the internal host as a normal user-managed service.** Rejected. Installation supplies supported runtime artifacts and the owning Client manages the process; users do not start or stop an engine to use the SDK.
- **Duplicate neutral schemas or create another manifest covering Providers, services, and helpers.** Rejected. Consume the canonical contracts with explicit execution bindings; retain protocol-specific stream/file/PTY semantics.
- **Require npm publication for template helpers or activate a helper on installation.** Rejected. Source packages and fixed Git are valid distribution paths; installation and explicit selection are separate actions.
- **Promise Node/Python parity from matching method names.** Rejected. Cross-language acceptance must compare actual inputs, outputs, exceptions, authentication, cancellation, and resource lifetime.

## Dependencies

The companion records below target `main`. Each link becomes available when that owner's planning PR merges; publishing a plan does not establish product delivery.

| Owner | Dependency and delivery order |
| --- | --- |
| [python-sdk plan](https://github.com/Alibaba-Agent-Sandbox/python-sdk/blob/main/.agents/notes/proposed/architecture/2026-11-27-unified-design-plan.md) | Own the neutral runtime contracts/fixtures, including private completion/access and `ApplicationSource`. Agree these before NJS-01; consume Node host artifacts for the Python Node-only path and run cross-language Server/Client checks. The existing exported configuration-name source remains coordinated with Python. |
| [awesome-providers plan](https://github.com/Alibaba-Agent-Sandbox/awesome-providers/blob/main/.agents/notes/proposed/architecture/2026-11-27-unified-design-plan.md) | Own installable catalog plugin descriptors, packages, and their platform implementations. The loader validates the selected package and consumes its declared complete operations; it does not invent missing methods. Common contracts do not move this repository's native Express implementation into the catalog. |
| [agent-sandbox plan](https://github.com/Alibaba-Agent-Sandbox/agent-sandbox/blob/main/.agents/notes/proposed/architecture/2026-11-27-unified-design-plan.md) | Consume the Node Client/runtime/source-preparation modules for CLI business calls, dynamic commands, and MCP. CLI parsing, output/prompting, private CLI state, and build/deploy orchestration stay there. Node has no reverse dependency. |
| [awesome-templates plan](https://github.com/Alibaba-Agent-Sandbox/awesome-templates/blob/main/.agents/notes/proposed/architecture/2026-11-27-unified-design-plan.md) | Own source templates, YAML contracts, author helper examples, and application-description delivery in source/build artifacts. Use Node Server exports and portable source packages after the producing interfaces exist. |
| [registry plan](https://github.com/Alibaba-Agent-Sandbox/registry/blob/main/.agents/notes/proposed/architecture/2026-11-27-unified-design-plan.md) | Display and resolve language-specific helper sources after the metadata contract lands; runtime operations remain independent of Registry. |

Deliver contracts first, then Node runtime/host and Server export, then consumer integrations using actual artifacts. Node's native path can proceed before Python consumes the optional host, but that cross-language branch remains pending until its real packaged artifact passes. Source resolution/preparation is reusable library functionality; it cannot depend on the CLI merely because the older implementation lives there.

## Test Strategy

For this proposed record, perform document/record/link checks when it lands; do not equate them with runtime acceptance. Future implementation uses the repository's Node version requirement and lockfile: `npm ci`, `npm run typecheck`, and `npm test`. Run `node examples/agent-loop.mjs` when the affected local runtime scenario and matching Python server are available, and record prerequisite failures separately. Additional tests belong in the configured test suite rather than being claimed from unrun examples.

Validate published package contents, ESM/type exports, import behavior, and dependency closure from an isolated installation outside the checkout. Verify that no CLI module, CLI configuration, ambient plugin registry, or runtime package manager is needed. For the internal host, test the actual packaged process from Python's supported environment, including startup handshake, private result transport, host failure, cancellation, backpressure, late initialization, and shutdown ownership.

Run the shared neutral fixtures in Node and compare observable behavior with Python. Use real Node and Python HTTP servers to cover registration/export identity, named calls versus REST, OpenAPI parameters/responses, platform/custom/default application authentication, file bytes, streaming, and error-preserving cleanup. Same-method-name checks and mocks alone do not establish interoperability.

Exercise an unpublished source helper through Node SDK preparation, normal import, CLI consumption, and MCP tool invocation using the same business implementation. Copy its project dependencies and lock to a clean environment and verify a real file-to-report result. Cover failed installation without damaging the existing usable version, conflicting package identity, explicit selection, removal, configured file roots, and cancellation between helper writes.

Real platform tests use fixed versions and a bounded resource set. Verify private-instance create/connect access continuity, fresh-machine use, missing/expired access behavior, application startup exactly once, and actual business outputs. Delete owned resources and independently query the result; keep borrowed resources. Record local, hosted, cloud, packaging, and release evidence separately, including unrun protocol/platform branches and cold/warm overhead rather than promising unmeasured latency.

## Acceptance criteria

- [ ] NJS-01 consumes the agreed neutral contract revision and fixtures without a divergent field set; public Node types and ESM exports match the implemented target scope.
- [ ] NJS-02 loads the selected Provider independently of CLI, and the real supported host artifact runs for Python without a user-managed engine or system Node prerequisite. Host loss and incomplete outcomes never become success or automatic write replay.
- [ ] NJS-03 supports an SDK-only install/create-or-connect/business/cleanup chain and preserves private access data without leaking it. CLI uses the same runtime methods and does not become a dependency of those methods.
- [ ] NJS-04 provides an actual Node Server SDK. A registered operation exports and serves one contract consumable by both Client languages; static `ApplicationSource` delivery does not import server code in the client or require CLI deployment records.
- [ ] NJS-05 prepares a helper from unpublished source, stores portable project dependencies, and invokes the same handler through Node SDK, CLI, and MCP. Installation does not choose a default or occur during import/help/business calls.
- [ ] A high-level create that fails or is cancelled during application preparation after obtaining an ID attempts bounded independent deletion and preserves the original cause, real ID, and actual cleanup result. Resource creation, explicit connection, authentication, cancellation, and deletion retry obey the same declared lifecycle in native and hosted paths. Closing one view/session does not close a sibling or delete a borrowed instance.
- [ ] NJS-06 records required checks, real interoperability/platform evidence for each claimed branch, independent resource cleanup, accurate bilingual documentation/examples, changelog, and package contents. Source merge, public package availability, and completed product acceptance remain separate claims.

## Evidence

Planning basis: the unified target design reviewed on 2026-11-27 and the Node repository's current contributor and engineering-record rules. The current package description and README scope were inspected as a baseline, not treated as the target implementation. This record includes no new runtime validation, deployment, package publication, or completed implementation claim; future verification belongs in this repository's normal evidence location.

Document validation and review disposition: [verification](../../../evidence/verify/2026-11-27-unified-design-plan.md).
