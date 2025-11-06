# Implementation Plan: MCP Server Starter Package

**Branch**: `001-mcp-server-starter` | **Date**: 2025-11-06 | **Spec**: specs/001-mcp-server-starter/spec.md
**Input**: Feature specification from `/specs/001-mcp-server-starter/spec.md`

**Note**: This plan is generated per `.github/prompts/speckit.plan.prompt.md`.

## Summary

Create an npm package that scaffolds a ready-to-run Model Context Protocol (MCP) server, plus commands to add tools and opt into integrations. Technical approach: implement a TypeScript CLI (Node >=18) using yargs/commander that generates a TypeScript MCP server template powered by `@modelcontextprotocol/sdk` and `zod`, enforce a dual-build (ESM + CJS) via `tsup`, and validate with Jest unit tests, contract smoke tests against built artifacts (ESM/CJS), and type tests via `tsd`. Provide idempotent operations, clear prompts/flags, and a minimal vs examples preset.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js >= 18 LTS  
**Primary Dependencies**:

- CLI: `yargs` (or `commander`) [final: yargs]
- Build: `tsup` (ESM + CJS), `typescript`
- Lint/Format: `eslint`, `@typescript-eslint/*`, `prettier`
- MCP server template: `@modelcontextprotocol/sdk`, `zod`
- Release: `changesets` (or `semantic-release`) [final: changesets]
  **Storage**: N/A (files only for scaffolding templates)  
  **Testing**: `jest` + `ts-jest` for unit; contract tests importing built package in ESM and CJS; `tsd` for type assertions  
  **Target Platform**: Node.js >= 18, cross-platform (Windows/macOS/Linux)  
  **Project Type**: Single package (library + CLI)  
  **Performance Goals**: Time-to-first-server < 3 minutes with defaults; scaffold latency < 5s on typical dev machines  
  **Constraints**: Dual-build with accurate exports map; strict TS; deterministic builds; CLI idempotency; no deep import surfaces  
  **Scale/Scope**: Initial scope limited to scaffolding + add-tool; optional integrations via presets

## Constitution Check

Gate evaluation against `specify/memory/constitution.md`:

1. Dual-Build, Single Source of Truth → Plan uses tsup to emit `dist/esm` and `dist/cjs`, exports map set; declarations + sourcemaps included. PASS
2. Public API and Types Are the Contract → Expose only via package.json exports; strict types; no `any` in exported types; doc deprecations when needed. PASS
3. Build, Lint, and Release Discipline → Strict TS config; ESLint+Prettier; changesets for versioning; CI to enforce gates. PASS
4. Runtime Compatibility and Tree‑Shaking → `engines: { node: ">=18" }`, accurate `sideEffects`; named exports; test CJS interop. PASS
5. Tests Across Builds and Types → Jest unit + contract tests on built ESM/CJS; `tsd` type tests; CI matrix across Node LTS. PASS

Status before Phase 0: All mandatory gates planned with concrete tooling. No blockers. Re-check after design artifacts are produced.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-server-starter/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (decisions + rationale)
├── data-model.md        # Phase 1 output (entities, rules, states)
├── quickstart.md        # Phase 1 output (how to use the starter)
└── contracts/           # Phase 1 output (OpenAPI for generated server)
```

### Source Code (repository root)

```text
src/
├── cli/                 # CLI entrypoints (bin)
├── generators/          # project + tool scaffolding logic
├── templates/           # files copied into generated projects
├── lib/                 # reusable library utilities
└── mcp/                 # sample server template bits (zod schemas, hooks)

tests/
├── unit/
├── contract/            # import built ESM+CJS and exercise CLI + API
└── types/               # tsd tests for exported types
```

**Structure Decision**: Single package (library + CLI) with clear separation between CLI, generators, templates, and reusable libs. Tests split into unit, contract, and type categories per constitution.

## Complexity Tracking

No constitution violations anticipated at this stage.
