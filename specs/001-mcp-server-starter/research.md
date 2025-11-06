# Research Findings and Decisions

This document consolidates Phase 0 research outcomes. All items previously marked as NEEDS CLARIFICATION are resolved below with decision, rationale, and alternatives.

## CLI Framework

- Decision: Use `yargs` for the CLI
- Rationale: Mature, widely used, great Windows support, robust parsing, prompts integration via companions; good DX for subcommands (init, add-tool).
- Alternatives considered: `commander` (excellent, slightly simpler API; chosen `yargs` for stronger ecosystem around prompts and config), `oclif` (powerful but heavier, plugin architecture unnecessary for scope).

## Build System (Dual ESM/CJS)

- Decision: Use `tsup` to produce `dist/esm` and `dist/cjs` with declarations and sourcemaps
- Rationale: Minimal config, fast esbuild-based, supports format matrix and types bundling; easy to wire to exports map.
- Alternatives considered: `rollup` (fine-grained control but more config), `tsc` only (no bundling → poorer DX, slower cold-start for consumers), `esbuild` raw (needs more glue to emit types).

## Package Release and Versioning

- Decision: Use `changesets` for versioning and changelog generation
- Rationale: Simple local flow, great for libraries, PR-based changes; integrates well with CI.
- Alternatives considered: `semantic-release` (excellent automation but more moving parts and CI coupling).

## Testing Strategy

- Decision: `jest` + `ts-jest` for unit tests; contract tests against built ESM/CJS; `tsd` for type tests
- Rationale: Jest requested by user; `ts-jest` enables TS source tests; contract tests validate exports map and CJS interop; `tsd` ensures no `any` leaks.
- Alternatives considered: `vitest` (fast but user preference is Jest), `dtslint` (older; `tsd` is simpler).

## MCP Server SDK and Schemas

- Decision: Use `@modelcontextprotocol/sdk` with `zod` schemas in the generated server template
- Rationale: Aligns with contemporary MCP implementations; `zod` provides strong runtime validation and TS inference for tool contracts.
- Alternatives considered: custom minimal protocol shims (risk of divergence), JSON Schema only (no TS inference).

## Optional HTTP Adapter and Contracts

- Decision: Provide a minimal optional HTTP adapter in the template with an OpenAPI spec for `/health` and a sample `/tools/{toolName}/invoke`
- Rationale: Helpful for smoke tests and demos; keeps protocol-specific transport separate from core MCP logic.
- Alternatives considered: no HTTP at all (still acceptable; we keep adapter optional and documented).

## Project Structure

- Decision: Single package (library + CLI) with `src/{cli,generators,templates,lib,mcp}` and tests split into `unit`, `contract`, `types`
- Rationale: Keeps complexity down while meeting constitution gates; templates kept separate for clarity.
- Alternatives considered: monorepo with separate `packages/cli` and `packages/core` (overkill for initial scope).

## Node Engines and Compatibility

- Decision: `engines.node >= 18`, named exports, accurate `sideEffects`, test CJS interop.
- Rationale: Matches constitution and modern LTS support.
- Alternatives considered: support Node 16 (EOL; increases maintenance).

All clarifications resolved. Proceeding to Phase 1 design artifacts.
