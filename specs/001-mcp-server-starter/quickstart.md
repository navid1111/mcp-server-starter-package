# Quickstart for MCP Server Starter (TypeScript + Jest)

This guide shows how a user would consume the starter package to scaffold and run an MCP server, plus how to add a tool.

> Requirements: Node.js >= 18, npm or pnpm, git

## 1) Install the starter (global or npx)

```powershell
# Global install (optional)
npm install -g mcp-server-starter

# OR run via npx (no global install)
npx mcp-server-starter init
```

## 2) Scaffold a new server

```powershell
# In an empty directory (PowerShell)
mkdir my-mcp-server; cd my-mcp-server

# Run the starter with prompts (defaults: minimal preset)
npx mcp-server-starter init --name my-mcp-server --preset minimal

# Install deps and run
npm install
npm start
```

Expected: the server starts and a health check responds. If the optional HTTP adapter is enabled, visit http://localhost:8787/health.

## 3) Add a new tool

```powershell
# From the generated project root
npx mcp-server-starter add-tool --name echo

# Start the server and invoke the tool (via adapter or runner)
npm start
# If HTTP adapter is enabled, POST to /tools/echo/invoke
```

## 4) Run tests

```powershell
# Unit tests (Jest)
npm test

# Type tests (tsd)
npm run test:types

# Contract tests against built artifacts (ESM + CJS)
npm run build
npm run test:contract
```

## 5) Build and publish (library maintainer)

```powershell
# Typecheck and build dual outputs
npm run typecheck; npm run build

# Create a changeset and version
npx changeset
npx changeset version
npm publish --access public
```

## Notes

- Generated projects are TypeScript-first with strict mode enabled.
- Exports map supports both ESM and CJS; consumers can `import` or `require`.
- Jest is configured for TS via `ts-jest`.
- Type assertions via `tsd` ensure exported types are stable.
