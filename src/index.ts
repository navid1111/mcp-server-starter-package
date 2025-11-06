/**
 * MCP Server Starter - Main Library Exports
 *
 * This file exports the public API of the library.
 * Will be populated with generator functions and types as they are implemented.
 */

// Placeholder export to satisfy build
export const version = '0.1.0';

// Export types (Phase 2)
export type * from './types/generators.js';

// Export utilities (Phase 2)
export * as fsUtils from './lib/fs.js';
export * as templateUtils from './lib/templates.js';

// TODO: Export generators in later phases
// export * from './generators/project.js';
// export * from './generators/addTool.js';
