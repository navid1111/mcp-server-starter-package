/**
 * Type definitions for generator options
 *
 * These types define the shape of options passed to:
 * - Project generator (init command)
 * - Tool generator (add-tool command)
 */

/**
 * Options for initializing a new MCP server project
 */
export interface InitOptions {
  /** Project name (kebab-case) */
  name: string;
  /** Project description */
  description?: string;
  /** Template preset to use */
  preset: 'minimal' | 'examples';
  /** Include optional HTTP adapter */
  withHttpAdapter: boolean;
  /** Target directory (defaults to current directory) */
  targetDir?: string;
}

/**
 * Options for adding a tool to an existing project
 */
export interface AddToolOptions {
  /** Tool name (camelCase) */
  name: string;
  /** Tool display title */
  title?: string;
  /** Tool description */
  description?: string;
  /** Project directory (defaults to current directory) */
  projectDir?: string;
}

/**
 * Result of a generation operation
 */
export interface GenerationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Files that were created/modified */
  filesCreated: string[];
  /** Files that were skipped (already existed) */
  filesSkipped: string[];
  /** Error message if operation failed */
  error?: string;
}

/**
 * Template variables for project generation
 */
export interface ProjectTemplateVariables {
  projectName: string;
  projectDescription: string;
  mcpSdkVersion: string;
  withHttpAdapter: boolean;
  preset: string;
  [key: string]: string | boolean | number;
}

/**
 * Template variables for tool generation
 */
export interface ToolTemplateVariables {
  toolName: string;
  toolNamePascal: string;
  toolTitle: string;
  toolDescription: string;
  [key: string]: string | boolean | number;
}

/**
 * Integration preset configuration
 */
export interface IntegrationPreset {
  /** Preset identifier */
  label: string;
  /** Files to include from this preset */
  files: string[];
  /** Whether enabled by default */
  enabledByDefault: boolean;
}
