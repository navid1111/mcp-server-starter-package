# Manual Test: US1 - Scaffold a New MCP Server

**User Story 1**: Generate a ready-to-run MCP server project with a single command.

## Test Objective

Verify that a developer can scaffold a new MCP server project, install dependencies, build, and run the server successfully.

## Prerequisites

- Node.js >= 18.0.0 installed
- npm installed
- mcp-server-starter CLI built (`npm run build`)

## Test Environment

- **OS**: Windows, macOS, or Linux
- **Shell**: PowerShell, bash, or zsh
- **Working Directory**: Empty directory or temp location

## Automated Test

Use the smoke test script for quick verification:

```powershell
# Windows PowerShell
.\scripts\smoke\scaffold-and-run.ps1

# With auto-cleanup
.\scripts\smoke\scaffold-and-run.ps1 -CleanUp
```

## Manual Test Steps

### Step 1: Verify CLI Build

```bash
# Ensure the CLI is built
npm run build

# Verify CLI executable exists
ls dist/cli/index.js
```

**Expected Result**: CLI executable exists at `dist/cli/index.js`

### Step 2: Create Test Directory

```bash
# Create and enter a temporary test directory
mkdir -p /tmp/mcp-test
cd /tmp/mcp-test
```

**Expected Result**: Empty directory ready for testing

### Step 3: Initialize New MCP Server

```bash
# Run init command (minimal preset)
node /path/to/mcp-server-starter/dist/cli/index.js init --name my-mcp-server --preset minimal
```

**Expected Output**:

```
Generating MCP server project: my-mcp-server...
Preset: minimal

✓ Project created successfully!

7 files created:
  - package.json
  - tsconfig.json
  - README.md
  - src/server.ts
  - src/mcp/tools/echo.ts
  - src/mcp/tools/index.ts
  - .gitignore

Next steps:
  cd my-mcp-server
  npm install
  npm run build
  npm start
```

**Expected Result**: Project directory created with all files

### Step 4: Verify Project Structure

```bash
cd my-mcp-server
ls -la
```

**Expected Files**:

- `package.json` - Project manifest with MCP SDK dependency
- `tsconfig.json` - TypeScript configuration
- `README.md` - Project documentation
- `src/server.ts` - MCP server entrypoint
- `src/mcp/tools/echo.ts` - Sample echo tool
- `src/mcp/tools/index.ts` - Tool registry
- `.gitignore` - Git ignore rules

### Step 5: Verify package.json

```bash
cat package.json
```

**Expected Content**:

- Project name matches: `"name": "my-mcp-server"`
- MCP SDK dependency: `"@modelcontextprotocol/sdk": "^0.5.0"`
- Build script: `"build": "tsc"`
- Start script: `"start": "node dist/server.js"`

### Step 6: Install Dependencies

```bash
npm install
```

**Expected Result**:

- No errors during installation
- `node_modules` directory created
- `package-lock.json` generated

### Step 7: Build Project

```bash
npm run build
```

**Expected Output**:

```
> my-mcp-server@1.0.0 build
> tsc
```

**Expected Result**:

- Build completes without errors
- `dist/` directory created
- `dist/server.js` exists
- TypeScript declaration files (`.d.ts`) generated

### Step 8: Verify Build Output

```bash
ls dist/
```

**Expected Files**:

- `server.js` - Compiled server
- `server.d.ts` - Type declarations
- `mcp/tools/echo.js` - Compiled tool
- `mcp/tools/index.js` - Compiled registry

### Step 9: Start MCP Server

```bash
npm start
```

**Expected Behavior**:

- Server starts without errors
- Server listens on stdio (no port output)
- Process does not exit immediately
- No unhandled exceptions

**To Test Server Interaction**: The server communicates via JSON-RPC over stdio. You can test using:

1. **Claude Desktop** or another MCP client
2. **Manual JSON-RPC messages** via stdin:

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
```

Expected response includes the `echo` tool.

### Step 10: Stop Server

Press `Ctrl+C` to stop the server.

**Expected Result**: Server shuts down cleanly

## Test Validation Criteria

- ✅ CLI executes without errors
- ✅ Project scaffolds in seconds (< 5s)
- ✅ All 7 expected files created
- ✅ File contents use correct template variables
- ✅ Dependencies install successfully
- ✅ TypeScript build succeeds
- ✅ Server starts and runs
- ✅ No TypeScript errors
- ✅ No runtime errors

## Success Criteria (from spec.md)

**Independent Test**:

> In an empty directory, run: `npx mcp-server-starter init --name my-mcp-server --preset minimal`; then `npm install; npm start`; health/tool check responds OK.

**Result**: ✅ PASS if all steps complete successfully

## Common Issues & Troubleshooting

### Issue: "Template not found"

**Cause**: CLI not properly built or templates not included in package.

**Solution**:

```bash
npm run build
# Verify templates exist
ls src/templates/project/
```

### Issue: "Module not found" during runtime

**Cause**: Dependencies not installed or build output incorrect.

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Server exits immediately

**Cause**: Syntax error or runtime exception.

**Solution**: Check console output for error messages, verify TypeScript compilation.

### Issue: TypeScript errors during build

**Cause**: Invalid template content or missing dependencies.

**Solution**: Review `tsconfig.json` and verify all dependencies are installed.

## Test Results Log

| Date       | Tester | OS  | Node Version | Result | Notes      |
| ---------- | ------ | --- | ------------ | ------ | ---------- |
| YYYY-MM-DD | Name   | OS  | vX.X.X       | ✅/❌  | Any issues |

---

## Next Steps

After US1 smoke test passes:

- **US2**: Test adding a new tool to existing server (`add-tool` command)
- **US3**: Test preset variations and HTTP adapter
- **Integration**: Test with real MCP clients (Claude Desktop)
