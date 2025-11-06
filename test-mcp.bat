@echo off
REM Test MCP Server with OpenAI
REM 
REM Usage: 
REM   1. Set your OpenAI API key: set OPENAI_API_KEY=sk-...
REM   2. Run this script: test-mcp.bat

echo ╔════════════════════════════════════════════════╗
echo ║  MCP Server Test Setup                        ║
echo ╚════════════════════════════════════════════════╝
echo.

if "%OPENAI_API_KEY%"=="" (
    echo ❌ Error: OPENAI_API_KEY environment variable not set
    echo.
    echo Please set your OpenAI API key first:
    echo   set OPENAI_API_KEY=sk-your-key-here
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✓ OpenAI API key found
echo.
echo 🚀 Starting test...
echo.

node test-with-openai.js

echo.
pause
