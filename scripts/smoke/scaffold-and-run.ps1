#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Smoke test: Scaffold and run a new MCP server
.DESCRIPTION
    This script tests the complete workflow:
    1. Initialize a new MCP server project
    2. Install dependencies
    3. Build the project
    4. Start the server (briefly)
    5. Verify basic functionality
.PARAMETER CleanUp
    Remove test project after completion
.EXAMPLE
    .\scaffold-and-run.ps1
    .\scaffold-and-run.ps1 -CleanUp
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
$projectName = "smoke-test-server-$(Get-Random -Maximum 99999)"
$testDir = Join-Path $env:TEMP $projectName
$cliPath = Join-Path $PSScriptRoot ".." ".." "dist" "cli" "index.js"

Write-Host "`n=== MCP Server Starter - Smoke Test ===" -ForegroundColor Magenta
Write-Host "Project: $projectName" -ForegroundColor Gray
Write-Host "Location: $testDir" -ForegroundColor Gray

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

    # Step 4: Verify project structure
    Write-Step "Verifying project structure..."
    $requiredFiles = @(
        "package.json",
        "tsconfig.json",
        "README.md",
        "src/server.ts",
        "src/mcp/tools/echo.ts",
        "src/mcp/tools/index.ts",
        ".gitignore"
    )

    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Failure "Missing file: $file"
            exit 1
        }
    }
    Write-Success "All required files present"

    # Step 5: Install dependencies
    Write-Step "Installing dependencies..."
    npm install --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"

    # Step 6: Build project
    Write-Step "Building project..."
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Failure "Build failed"
        exit 1
    }
    Write-Success "Build succeeded"

    # Step 7: Verify build output
    Write-Step "Verifying build output..."
    if (-not (Test-Path "dist/server.js")) {
        Write-Failure "Build output not found: dist/server.js"
        exit 1
    }
    Write-Success "Build output verified"

    # Step 8: Test server startup (quick check)
    Write-Step "Testing server startup..."
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/server.js" -PassThru -NoNewWindow
    Start-Sleep -Seconds 2

    if ($serverProcess.HasExited) {
        Write-Failure "Server exited immediately (exit code: $($serverProcess.ExitCode))"
        exit 1
    }

    # Server is running, stop it
    Stop-Process -Id $serverProcess.Id -Force
    Write-Success "Server started successfully"

    # Success!
    Write-Host "`n=== Smoke Test Passed! ===" -ForegroundColor Green
    Write-Host "✓ Project scaffolded" -ForegroundColor Green
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
    Write-Host "✓ Build succeeded" -ForegroundColor Green
    Write-Host "✓ Server starts" -ForegroundColor Green

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
        Write-Host "To run with auto-cleanup: .\scaffold-and-run.ps1 -CleanUp" -ForegroundColor Gray
    }
}

exit 0
