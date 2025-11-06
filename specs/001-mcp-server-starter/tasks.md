# Tasks – MCP Server Starter Package

Feature: MCP Server Starter Package (from plan.md)

Repo root (absolute): E:\mcp\mcp-server-starter-package
Feature dir (absolute): E:\mcp\mcp-server-starter-package\specs\001-mcp-server-starter

Notes

- Tasks follow strict checklist format.
- [P] means safe to do in parallel (no dependency, different files).
- Story labels [US1]/[US2]/[US3] only appear in user story phases.
- Each story includes independent test criteria (manual) derived from spec.md.

---

## Phase 1 — Setup (project initialization)

Independent test criteria (manual)

- After Phase 1, you can run `npm run lint` and `npm run typecheck` without errors.

Tasks

- [x] T001 Create package manifest with CLI bin and dual-build scripts in package.json
- [x] T002 Add TypeScript config for strict mode in tsconfig.json
- [x] T003 Add tsup config for ESM+CJS output in tsup.config.ts
- [x] T004 [P] Add ESLint config in .eslintrc.cjs and Prettier config in .prettierrc
- [x] T005 Add Jest config (ts-jest) in jest.config.ts and test script in package.json
- [x] T006 Configure changesets in .changeset/config.json and add .changeset/README.md
- [x] T007 Create base folders and stub files: src/cli/index.ts, src/lib/README.md, tests/README.md

---

## Phase 2 — Foundational (blocking prerequisites)

Independent test criteria (manual)

- After Phase 2, running `node dist/cli/index.js --help` (after build) displays CLI with init and add-tool commands.

Tasks

- [x] T008 Implement CLI entrypoint using yargs in src/cli/index.ts
- [x] T009 [P] Scaffold init command (flags/prompts placeholders) in src/cli/commands/init.ts
- [x] T010 [P] Scaffold add-tool command (flags/prompts placeholders) in src/cli/commands/addTool.ts
- [x] T011 Implement filesystem utilities (idempotent write, exists, copy) in src/lib/fs.ts
- [ ] T012 Implement template engine/renderer (variables, presets) in src/lib/templates.ts
- [ ] T013 Define generator types (InitOptions, AddToolOptions) in src/types/generators.ts
- [ ] T014 Ensure tsup build emits dist/esm and dist/cjs and maps bin in package.json

---

## Phase 3 — User Story 1 (P1): Scaffold a new MCP server quickly

Story goal

- Generate a ready-to-run MCP server project with a single command and start it locally without manual edits.

Independent test criteria (manual)

- In an empty directory, run: `npx mcp-server-starter init --name my-mcp-server --preset minimal`; then `npm install; npm start`; health/tool check responds OK.

Tasks

- [ ] T015 [US1] Create template: project package.json.tmpl in src/templates/project/package.json.tmpl
- [ ] T016 [P] [US1] Create template: tsconfig.json.tmpl in src/templates/project/tsconfig.json.tmpl
- [ ] T017 [P] [US1] Create template: server entry using @modelcontextprotocol/sdk and zod in src/templates/project/src/server.ts.tmpl
- [ ] T018 [P] [US1] Create template: sample tool (echo) in src/templates/project/src/mcp/tools/echo.ts.tmpl
- [ ] T019 [P] [US1] Create template: tool registry in src/templates/project/src/mcp/tools/index.ts.tmpl
- [ ] T020 [P] [US1] Create template: README with quickstart in src/templates/project/README.md.tmpl
- [ ] T021 [US1] Implement project generator (render/copy templates) in src/generators/project.ts
- [ ] T022 [US1] Implement flags/prompts for name, description, preset (minimal default) in src/cli/commands/init.ts
- [ ] T023 [US1] Add optional HTTP adapter toggle in init and plumb to templates in src/cli/commands/init.ts
- [ ] T024 [US1] Create manual smoke script scaffold-and-run in scripts/smoke/scaffold-and-run.ps1
- [ ] T025 [US1] Document manual test steps for US1 in docs/manual-tests/us1-smoke.md

Parallel execution examples

- T016, T017, T018, T019, T020 can be built in parallel after T015.

---

## Phase 4 — User Story 2 (P2): Add a tool to an existing server

Story goal

- Add a new tool via command; files created and registered without manual wiring.

Independent test criteria (manual)

- In a generated project, run `npx mcp-server-starter add-tool --name echo2`; start server; invoke tool; get deterministic response.

Tasks

- [ ] T026 [US2] Create template: tool stub file in src/templates/add-tool/tool.ts.tmpl
- [ ] T027 [P] [US2] Implement registry update logic (append import/export) in src/generators/addTool.ts
- [ ] T028 [P] [US2] Implement input validation and flags (toolName) in src/cli/commands/addTool.ts
- [ ] T029 [US2] Handle idempotency (skip or prompt on existing tool) in src/generators/addTool.ts
- [ ] T030 [US2] Create manual smoke script add-tool-and-invoke in scripts/smoke/add-tool-and-invoke.ps1
- [ ] T031 [US2] Document manual test steps for US2 in docs/manual-tests/us2-smoke.md

Parallel execution examples

- T027 and T028 can proceed in parallel after T026.

---

## Phase 5 — User Story 3 (P3): Choose integrations and configuration presets

Story goal

- During scaffold, user can opt into presets (minimal/examples) and optional integrations; server still runs.

Independent test criteria (manual)

- Generate with `--preset examples --with-http-adapter`; verify extra files exist; `npm start` works; optional OpenAPI is present.

Tasks

- [ ] T032 [US3] Implement preset selection and prompts in src/cli/commands/init.ts
- [ ] T033 [P] [US3] Create preset: examples files in src/templates/project/presets/examples/README.md.tmpl
- [ ] T034 [P] [US3] Create preset: sample additional tool in src/templates/project/presets/examples/src/mcp/tools/sample.ts.tmpl
- [ ] T035 [P] [US3] Create optional HTTP adapter template in src/templates/project/src/http/adapter.ts.tmpl
- [ ] T036 [P] [US3] Add OpenAPI template aligned to contracts in src/templates/project/openapi.yaml.tmpl
- [ ] T037 [US3] Create manual smoke script scaffold-examples-and-test in scripts/smoke/scaffold-examples-and-test.ps1
- [ ] T038 [US3] Document manual test steps for US3 in docs/manual-tests/us3-smoke.md

Parallel execution examples

- T033, T034, T035, T036 can proceed in parallel after T032.

---

## Final Phase — Polish & cross-cutting concerns

Independent test criteria (manual)

- `npx mcp-server-starter --help` shows help; CI passes lint/build/type; changeset exists.

Tasks

- [ ] T039 Add CLI help text, version flag, and examples in src/cli/index.ts
- [ ] T040 [P] Add top-level README with usage and examples in README.md
- [ ] T041 [P] Add CONTRIBUTING and CODE_OF_CONDUCT in CONTRIBUTING.md and CODE_OF_CONDUCT.md
- [ ] T042 [P] Add CI workflow for lint/type/build/test in .github/workflows/ci.yml
- [ ] T043 Finalize exports map and publish config in package.json
- [ ] T044 Add changeset entry for initial release in .changeset/\*
- [ ] T045 Add testing guide (manual + automation) in docs/TESTING.md
- [ ] T046 Link design docs (specs/\*) from repo docs in docs/INDEX.md

---

## Dependencies (story completion order)

- US1 → US2 (US2 depends on scaffolded project conventions)
- US1 → US3 (US3 depends on init pipeline and template system)
- Foundational → all user stories

Graph (simplified)

- Phase 1 → Phase 2 → US1 → { US2, US3 } → Final Phase

---

## Implementation strategy (MVP first)

- MVP scope: Implement US1 only (minimal preset, sample tool, server start OK) with Phase 1–2 done. Ship an alpha.
- Incremental delivery:
  1. MVP (US1) → public preview
  2. Add-tool (US2) → beta
  3. Presets (US3) + polish → 1.0

---

## Parallel opportunities summary

- Setup: T004 can run in parallel with T003; others mostly sequential.
- Foundational: T009 and T010 in parallel; T011–T013 can start after CLI shell (T008) exists.
- US1: T016–T020 in parallel after T015.
- US2: T027 and T028 in parallel after T026.
- US3: T033–T036 in parallel after T032.
- Final: T040–T042 in parallel after build pipeline is green.

---

## Validation of checklist format

- Every task line starts with `- [ ]` and includes a Task ID (T###).
- [P] appears only on parallelizable tasks.
- [USx] labels appear only on user story phases (US1/US2/US3).
- Each task includes a clear file path at the end of the description.
