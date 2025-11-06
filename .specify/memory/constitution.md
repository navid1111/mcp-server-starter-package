<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A (all newly defined)
- Added sections: Core Principles; Additional Constraints; Development Workflow; Governance
- Removed sections: None
- Templates requiring updates:
	✅ .specify/templates/plan-template.md (aligned; updated note reference)
	✅ .specify/templates/spec-template.md (no change needed)
	✅ .specify/templates/tasks-template.md (tests wording aligned; added constitution-driven examples)
	⚠ .specify/templates/commands/* (no such directory; nothing to update)
	⚠ Runtime docs (README.md) not present → TODO to create quickstart aligning with principles
- Deferred TODOs:
	TODO(README_QUICKSTART): Add quickstart with build/test/release commands and Node version support matrix
-->

# MCP Server Starter Package Constitution

## Core Principles

### I. Dual-Build, Single Source of Truth

The package MUST publish both ESM and CommonJS artifacts from a single TypeScript
source tree. Package.json MUST define an exports map with explicit "import" (ESM)
and "require" (CJS) entry points. Declarations (.d.ts) and source maps MUST be
published for the public API. ESM is the primary format; CJS is provided for
compatibility.

Rationale: Many consumers are still on CJS while modern tooling prefers ESM. A
dual-build ensures broad usability for JavaScript and TypeScript users across
Node and bundlers without duplicating source.

### II. Public API and Types Are the Contract (NON-NEGOTIABLE)

All exported symbols are a stable contract. The public surface MUST be exposed
only through package.json exports (no deep imports). Type declarations MUST be
complete for the public API and avoid "any" in exported types. Breaking API or
type changes require a MAJOR version. Deprecations MUST include runtime JSDoc
tags and changelog entries for at least one MINOR before removal.

Rationale: Consumers (TS and JS) rely on stable types and paths. Types are the
executable specification and enable safer upgrades.

### III. Build, Lint, and Release Discipline

The project MUST maintain a reproducible build and release pipeline:

- TypeScript strict mode enabled (noImplicitAny, strictNullChecks, etc.).
- Linting and formatting enforced (ESLint + Prettier) with CI gates.
- Build produces ESM and CJS with source maps and bundled types.
- Conventional commits with automated versioning (e.g., Changesets or
  semantic-release) and changelog generation.
- package.json MUST include: name, version, type, exports map, main/module (as
  needed), types, files, sideEffects, engines, license, repository, funding,
  keywords, author.

Rationale: Deterministic builds and consistent releases reduce integration risk
and enable automated consumption.

### IV. Runtime Compatibility and Tree‑Shaking

Supported Node engines MUST be declared (>=18 LTS by default). For browser-
targeted code, Node-only APIs are disallowed or MUST be polyfilled behind
conditional exports. The sideEffects field MUST be accurate to enable tree-
shaking. Prefer named exports; if a default export is provided, CJS interop MUST
be tested for both require('pkg') and require('pkg').default patterns.

Rationale: Clear runtime guarantees and properly annotated modules improve
bundle quality and prevent runtime surprises.

### V. Tests Across Builds and Types (NON-NEGOTIABLE)

Tests MUST execute against built artifacts and sources:

- Unit tests for public API behavior.
- Contract/smoke tests importing the built package via both ESM (import) and CJS
  (require).
- Type tests (e.g., tsd or dtslint) that validate consumer typing and ensure no
  "any" leaks in exported declarations.
- CI matrix across supported Node LTS versions.

Rationale: Verifying both runtime builds and the type surface catches the most
common integration failures before release.

## Additional Constraints

- Directory layout: source in ./src; build output in ./dist/{esm,cjs}.
- tsconfig.json: strict true; declaration true; sourceMap true; moduleResolution
  node16 or bundler; module esnext; target es2022 (or project standard).
- Exports map example:
  - "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.cjs" } }
- No deep import paths may be documented or supported.
- npm pack MUST contain only files listed in files array; exclude tests and
  config unless required.
- Security: enable npm provenance in releases; scan dependencies in CI.
- Documentation: README MUST show ESM and CJS usage and TypeScript import
  examples when README is added.

## Development Workflow, Review Process, Quality Gates

Pre-merge checks (MUST PASS):

1. Lint + format clean.
2. Typecheck succeeds (tsc --noEmit) for the source.
3. Build both ESM and CJS outputs with declarations and source maps.
4. Tests pass: unit, contract (import/require), and type tests.
5. API surface review: imports only via exports; no deep imports; verify sideEffects
   and engines fields.
6. Release hygiene: changeset or release note present for public changes; npm
   pack --dry-run inspected in CI.

Review expectations:

- PRs MUST include usage examples for new public APIs (TS and JS snippets).
- Any deprecation MUST include migration notes and timeframe.
- Any runtime support change (engines/browsers) MUST be called out explicitly.

## Governance

- This constitution supersedes conflicting practices in this repository.
- Amendments require a PR including: proposed text, bump rationale (MAJOR/MINOR/
  PATCH), migration plan when applicable, and updates to dependent templates.
- Versioning policy follows SemVer for the constitution itself:
  - MAJOR: incompatible governance changes or removal/redefinition of a
    principle.
  - MINOR: new principle/section or material expansion of guidance.
  - PATCH: clarifications and non-semantic wording fixes.
- Compliance: All implementation plans must include a "Constitution Check"
  section that evaluates these gates. CI must block merges that fail required
  gates without approved exceptions documented in the plan.

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
