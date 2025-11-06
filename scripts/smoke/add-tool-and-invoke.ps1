#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Smoke test: Add a tool to an existing MCP server
.DESCRIPTION
    This script tests the add-tool workflow:
    1. Create a new MCP server project
    2. Install dependencies and build
    3. Add a new tool using add-tool command
    4. Verify tool file is created
    5. Verify registry is updated
    6. Rebuild and test server starts
.PARAMETER CleanUp
    Remove test project after completion
.EXAMPLE
    .\add-tool-and-invoke.ps1
    .\add-tool-and-invoke.ps1 -CleanUp
#>

param(
    [switch]$CleanUp = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Step {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Configuration
$projectName = "smoke-add-tool-$(Get-Random -Maximum 99999)"
$testDir = Join-Path $env:TEMP $projectName
$cliPath = Join-Path $PSScriptRoot ".." ".." "dist" "cli" "index.js"
$newToolName = "calculator"

Write-Host "`n=== MCP Server Starter - Add Tool Smoke Test ===" -ForegroundColor Magenta
Write-Host "Project: $projectName" -ForegroundColor Gray
Write-Host "Location: $testDir" -ForegroundColor Gray
Write-Host "New tool: $newToolName" -ForegroundColor Gray

try {
    # Step 1: Verify CLI is built
    Write-Step "Verifying CLI build..."
    if (-not (Test-Path $cliPath)) {
        Write-Failure "CLI not found at $cliPath"
        Write-Host "Run 'npm run build' first" -ForegroundColor Yellow
        exit 1
    }
    Write-Success "CLI found"

    # Step 2: Initialize project
    Write-Step "Initializing new MCP server..."
    $output = node $cliPath init --name $projectName --preset minimal 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Init command failed"
        Write-Host $output
        exit 1
    }
    Write-Success "Project initialized"

    # Step 3: Change to project directory
    Write-Step "Entering project directory..."
    Push-Location $testDir
    Write-Success "Working directory: $testDir"

    # Step 4: Install dependencies
    Write-Step "Installing dependencies..."
    npm install --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"

    # Step 5: Initial build
    Write-Step "Building project..."
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Initial build failed"
        exit 1
    }
    Write-Success "Initial build succeeded"

    # Step 6: Add new tool
    Write-Step "Adding new tool: $newToolName..."
    $output = node $cliPath add-tool --name $newToolName --title "Calculator" --description "Performs calculations" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Add-tool command failed"
        Write-Host $output
        exit 1
    }
    Write-Success "Tool added"

    # Step 7: Verify tool file was created
    Write-Step "Verifying tool file..."
    $toolPath = "src\mcp\tools\$newToolName.ts"
    if (-not (Test-Path $toolPath)) {
        Write-Failure "Tool file not found: $toolPath"
        exit 1
    }
    Write-Success "Tool file exists: $toolPath"

    # Step 8: Verify tool is registered
    Write-Step "Verifying tool registration..."
    $registryPath = "src\mcp\tools\index.ts"
    $registryContent = Get-Content $registryPath -Raw

    if ($registryContent -notmatch "import.*$newToolName") {
        Write-Failure "Tool import not found in registry"
        exit 1
    }

    if ($registryContent -notmatch "\[$newToolName") {
        Write-Failure "Tool export not found in registry"
        exit 1
    }
    Write-Success "Tool registered in index.ts"

    # Step 9: Rebuild with new tool
    Write-Step "Rebuilding with new tool..."
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Build with new tool failed"
        exit 1
    }
    Write-Success "Build succeeded with new tool"

    # Step 10: Verify build output includes new tool
    Write-Step "Verifying build output..."
    if (-not (Test-Path "dist\mcp\tools\$newToolName.js")) {
        Write-Failure "Compiled tool not found in dist"
        exit 1
    }
    Write-Success "Compiled tool file exists"

    # Step 11: Test server startup
    Write-Step "Testing server startup..."
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "dist\server.js" -PassThru -NoNewWindow
    Start-Sleep -Seconds 2

    if ($serverProcess.HasExited) {
        Write-Failure "Server exited immediately (exit code: $($serverProcess.ExitCode))"
        exit 1
    }

    # Server is running, stop it
    Stop-Process -Id $serverProcess.Id -Force
    Write-Success "Server started successfully with new tool"

    # Step 12: Test idempotency (add same tool again)
    Write-Step "Testing idempotency (adding same tool)..."
    $output = node $cliPath add-tool --name $newToolName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Failure "Add-tool should have failed for existing tool"
        exit 1
    }
    if ($output -notmatch "already exists") {
        Write-Failure "Expected 'already exists' error message"
        exit 1
    }
    Write-Success "Idempotency check passed"

    # Step 13: Test force overwrite
    Write-Step "Testing force overwrite..."
    $output = node $cliPath add-tool --name $newToolName --force 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Add-tool with --force failed"
        Write-Host $output
        exit 1
    }
    Write-Success "Force overwrite succeeded"

    # Success!
    Write-Host "`n=== Add Tool Smoke Test Passed! ===" -ForegroundColor Green
    Write-Host "✓ Project scaffolded" -ForegroundColor Green
    Write-Host "✓ Tool added via command" -ForegroundColor Green
    Write-Host "✓ Tool file created" -ForegroundColor Green
    Write-Host "✓ Registry updated automatically" -ForegroundColor Green
    Write-Host "✓ Build succeeded with new tool" -ForegroundColor Green
    Write-Host "✓ Server starts with new tool" -ForegroundColor Green
    Write-Host "✓ Idempotency handled correctly" -ForegroundColor Green
    Write-Host "✓ Force overwrite works" -ForegroundColor Green

} catch {
    Write-Failure "Smoke test failed: $_"
    exit 1
} finally {
    # Clean up
    Pop-Location

    if ($CleanUp) {
        Write-Step "Cleaning up test project..."
        if (Test-Path $testDir) {
            Remove-Item -Path $testDir -Recurse -Force
            Write-Success "Cleanup complete"
        }
    } else {
        Write-Host "`nTest project preserved at: $testDir" -ForegroundColor Yellow
        Write-Host "To clean up manually: Remove-Item '$testDir' -Recurse -Force" -ForegroundColor Gray
        Write-Host "To run with auto-cleanup: .\add-tool-and-invoke.ps1 -CleanUp" -ForegroundColor Gray
    }
}

exit 0
