# Data Model for MCP Server Starter

This document captures entities, fields, relationships, and validation derived from the feature spec.

## Entities

### 1) Server Template

- Description: The set of files and configuration that produce a runnable MCP server when generated.
- Fields:
  - name: string (required, kebab-case)
  - description: string (optional, 0-280 chars)
  - preset: enum { minimal, examples } (default: minimal)
  - integrations: string[] (labels of optional presets; default: [])
  - runtime: enum { node } (fixed: node)
  - mcpSdkVersion: string (semver range, default: "^0.x")
- Validation rules:
  - name must be a valid npm package name subset (kebab-case; no spaces)
  - description length <= 280
  - preset one of allowed values

### 2) Tool

- Description: A unit of callable functionality exposed by the server.
- Fields:
  - toolName: string (required, camelCase)
  - title: string (optional)
  - description: string (optional)
  - inputSchema: JSON Schema or Zod schema definition (required)
  - outputSchema: JSON Schema or Zod schema definition (required)
  - handlerPath: string (generated file path)
  - registered: boolean (computed after wiring)
- Validation rules:
  - toolName must be a valid identifier; check for collisions
  - schema definitions must parse/compile; provide scaffolded defaults for sample tool

### 3) Integration Preset

- Description: Optional helpers (runner hooks, AI connector placeholders) included based on user choice.
- Fields:
  - label: string (required)
  - files: string[] (paths into generated project)
  - enabledByDefault: boolean (default: false)
- Validation rules:
  - label in known set; files must map to existing template files

## Relationships

- Server Template has many Tools (1:N)
- Server Template has many IntegrationPresets (optional, N)

## State Transitions

- Server Template
  - INIT → GENERATED → RUNNABLE
  - Constraints: After GENERATED, `npm install` must succeed; RUNNABLE requires `npm start` success and `/health` responds.
- Tool
  - SCAFFOLDED → REGISTERED → INVOKABLE
  - Constraints: REGISTERED when wired in the server registry; INVOKABLE when server exposes tool and returns deterministic response.

## Derived/Computed

- `registered` on Tool is computed by scanning the generated config/registry file.
- README quickstart sections vary by `preset`.

## Notes

- Use Zod for schemas in code and (optionally) emit JSON Schema for OpenAPI alignment.
