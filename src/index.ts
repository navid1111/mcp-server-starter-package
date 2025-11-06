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

// Export generators (Phase 3)
export * from './generators/project.js';

// TODO: Export add-tool generator in Phase 4
// export * from './generators/addTool.js';
