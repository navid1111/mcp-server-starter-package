# Manual Test: US2 - Add a Tool to an Existing Server

**User Story 2**: Add a new tool via command; files created and registered without manual wiring.

## Test Objective

Verify that a developer can add a new tool to an existing MCP server using the `add-tool` command, with automatic registry updates and proper file generation.

## Prerequisites

- Node.js >= 18.0.0 installed
- npm installed
- mcp-server-starter CLI built (`npm run build`)
- An existing MCP server project (from US1 test or create new one)

## Test Environment

- **OS**: Windows, macOS, or Linux
- **Shell**: PowerShell, bash, or zsh
- **Working Directory**: Inside an existing MCP server project

## Automated Test

Use the smoke test script for quick verification:

```powershell
# Windows PowerShell
.\scripts\smoke\add-tool-and-invoke.ps1

# With auto-cleanup
.\scripts\smoke\add-tool-and-invoke.ps1 -CleanUp
```

## Manual Test Steps

### Setup: Create Test Project

If you don't have an existing project from US1, create one:

```bash
# In a temp directory
node /path/to/mcp-server-starter/dist/cli/index.js init --name test-server --preset minimal
cd test-server
npm install
npm run build
```

### Step 1: Verify Existing Project Structure

```bash
ls src/mcp/tools/
```

**Expected Files**:

- `echo.ts` - Default sample tool
- `index.ts` - Tool registry

### Step 2: Add a New Tool (Calculator)

```bash
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name calculator --title "Calculator" --description "Performs mathematical calculations"
```

**Expected Output**:

```
Adding tool: calculator...
Title: Calculator
Description: Performs mathematical calculations

✓ Tool added successfully!

1 file(s) created:
  - src/mcp/tools/calculator.ts

Next steps:
  1. Edit the tool implementation in src/mcp/tools/calculator.ts
  2. Define input schema and implement handler logic
  3. Rebuild: npm run build
  4. Test: npm start
```

**Expected Result**: Command succeeds with success message

### Step 3: Verify Tool File Created

```bash
cat src/mcp/tools/calculator.ts
```

**Expected Content**:

- Tool file exists at correct path
- Contains calculator tool template
- Has TODO comments for implementation
- Uses zod for input validation
- Exports `calculatorTool` object

### Step 4: Verify Registry Updated

```bash
cat src/mcp/tools/index.ts
```

**Expected Content**:

```typescript
import { echoTool } from './echo.js';
import { calculatorTool } from './calculator.js'; // NEW LINE

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: unknown) => Promise<{
    content: Array<{ type: string; text: string }>;
  }>;
}

export const tools: Record<string, Tool> = {
  [echoTool.name]: echoTool,
  [calculatorTool.name]: calculatorTool, // NEW LINE
};
```

**Expected Result**: Import and export added automatically

### Step 5: Build Project with New Tool

```bash
npm run build
```

**Expected Output**:

```
> test-server@1.0.0 build
> tsc
```

**Expected Result**:

- Build completes without errors
- No TypeScript errors
- `dist/mcp/tools/calculator.js` created

### Step 6: Verify Compiled Output

```bash
ls dist/mcp/tools/
```

**Expected Files**:

- `echo.js` - Original tool
- `echo.d.ts`
- `calculator.js` - NEW tool
- `calculator.d.ts`
- `index.js` - Updated registry
- `index.d.ts`

### Step 7: Test Server with New Tool

```bash
npm start
```

**Expected Behavior**:

- Server starts without errors
- No unhandled exceptions
- Server ready to receive tool invocations

**To List Tools** (via JSON-RPC on stdin):

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
```

Expected response includes both `echo` and `calculator` tools.

Stop server with `Ctrl+C`.

### Step 8: Test Idempotency (Add Same Tool)

```bash
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name calculator
```

**Expected Output**:

```
Adding tool: calculator...

Error: Tool already exists: calculator.ts (use --force to overwrite)
```

**Expected Result**: Command fails with clear error message

### Step 9: Test Force Overwrite

```bash
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name calculator --force
```

**Expected Output**:

```
Adding tool: calculator...

✓ Tool added successfully!

0 file(s) created:

1 file(s) skipped (already exist):
  - src/mcp/tools/calculator.ts

Next steps:
  ...
```

**Expected Result**: Command succeeds, file overwritten

### Step 10: Test with Prompt (No Name Provided)

```bash
node /path/to/mcp-server-starter/dist/cli/index.js add-tool
```

**Expected Behavior**:

- Prompts: `Tool name (camelCase): `
- Wait for user input
- Enter `converter`
- Tool is created successfully

### Step 11: Test Name Validation

```bash
# Invalid: starts with uppercase
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name Calculator

# Invalid: contains hyphen
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name my-tool

# Invalid: contains space
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name "my tool"

# Valid: camelCase
node /path/to/mcp-server-starter/dist/cli/index.js add-tool --name myTool
```

**Expected Result**: Invalid names rejected, valid name accepted

## Test Validation Criteria

- ✅ CLI add-tool command executes
- ✅ Tool file created in correct location
- ✅ Tool file uses correct template variables
- ✅ Tool registry (index.ts) updated automatically
- ✅ Import statement added correctly
- ✅ Export statement added correctly
- ✅ Project builds without TypeScript errors
- ✅ Server starts with new tool
- ✅ Idempotency handled (existing tool detection)
- ✅ Force overwrite works
- ✅ Name validation enforces camelCase
- ✅ Prompts for missing required fields

## Success Criteria (from spec.md)

**Independent Test**:

> In a generated project, run `npx mcp-server-starter add-tool --name echo2`; start server; invoke tool; get deterministic response.

**Result**: ✅ PASS if all steps complete successfully

## Common Issues & Troubleshooting

### Issue: "Not in an MCP server project"

**Cause**: Running add-tool outside an MCP server project directory.

**Solution**: Navigate to project directory or create a project first with `init`.

### Issue: "Tools directory not found"

**Cause**: Project structure is corrupted or incomplete.

**Solution**: Re-initialize project or manually create `src/mcp/tools/` directory.

### Issue: "Could not parse tool registry structure"

**Cause**: Tool registry (index.ts) has been manually edited with unexpected structure.

**Solution**: Restore standard registry format or manually add import/export.

### Issue: TypeScript errors after adding tool

**Cause**: Template syntax error or missing dependencies.

**Solution**:

```bash
# Check template rendering
cat src/mcp/tools/<toolName>.ts

# Verify imports and syntax
npm run build
```

### Issue: Tool not showing in tools list

**Cause**: Registry not properly updated or build not executed.

**Solution**:

```bash
# Verify registry
cat src/mcp/tools/index.ts

# Rebuild
npm run build
npm start
```

## Test Results Log

| Date       | Tester | OS  | Node Version | Result | Notes      |
| ---------- | ------ | --- | ------------ | ------ | ---------- |
| YYYY-MM-DD | Name   | OS  | vX.X.X       | ✅/❌  | Any issues |

---

## Advanced Tests

### Multiple Tools

Add several tools in sequence:

```bash
node cli/index.js add-tool --name calculator
node cli/index.js add-tool --name converter
node cli/index.js add-tool --name formatter
```

Verify all are registered correctly.

### Tool with Long Name

```bash
node cli/index.js add-tool --name superLongToolNameForTesting
```

Verify name handling.

### Tool in Different Directory

```bash
# Run from different directory
cd ../
node /path/to/cli/index.js add-tool --name remoteTool
```

Should fail with "Not in an MCP server project" error.

---

## Next Steps

After US2 smoke test passes:

- **US3**: Test preset variations (examples) and HTTP adapter
- **Integration**: Test tool invocation via MCP clients
- **Performance**: Test with many tools (10+)
