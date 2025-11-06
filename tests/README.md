# Tests

This directory contains all test suites for the MCP Server Starter package.

## Directory structure

- `unit/` - Unit tests for individual functions and modules
- `contract/` - Contract tests for built ESM/CJS artifacts
- `types/` - Type tests using tsd for exported types

## Running tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run contract tests (requires build first)
npm run build
npm run test:contract

# Run type tests
npm run test:types
```

Tests will be added during implementation phases.
