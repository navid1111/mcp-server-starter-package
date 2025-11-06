/**
 * Add Tool generator - Adds a new tool to an existing MCP server
 *
 * This generator:
 * - Creates a new tool file from template
 * - Updates the tool registry (index.ts) with import/export
 * - Handles idempotency (skips if tool already exists)
 */

import path from 'node:path';
import * as fsUtils from '../lib/fs.js';
import * as templateUtils from '../lib/templates.js';
import type {
  AddToolOptions,
  GenerationResult,
  ToolTemplateVariables,
} from '../types/generators.js';

/**
 * Generate template variables from options
 */
function createTemplateVariables(options: AddToolOptions): ToolTemplateVariables {
  const toolName = templateUtils.sanitizeToolName(options.name);
  const toolNamePascal = templateUtils.toPascalCase(toolName);
  const toolTitle = options.title || toolNamePascal;
  const toolDescription = options.description || `${toolTitle} tool`;

  return {
    toolName,
    toolNamePascal,
    toolTitle,
    toolDescription,
  };
}

/**
 * Get the path to the tool template
 */
function getToolTemplatePath(): string {
  // In development: src/templates/add-tool/tool.ts.tmpl
  // In production: dist/*/templates/add-tool/tool.ts.tmpl (bundled)
  // We'll search upward for package.json like we do in project.ts
  const templateRelPath = path.join('src', 'templates', 'add-tool', 'tool.ts.tmpl');

  let currentDir = path.dirname(new URL(import.meta.url).pathname);
  // Remove leading '/' on Windows (file:///C:/... becomes C:/...)
  if (currentDir.startsWith('/') && currentDir.charAt(2) === ':') {
    currentDir = currentDir.slice(1);
  }

  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fsUtils.exists(packageJsonPath)) {
      return path.join(currentDir, templateRelPath);
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  // Fallback
  return path.join(currentDir, '..', '..', templateRelPath);
}

/**
 * Update the tool registry (index.ts) to include the new tool
 */
async function updateToolRegistry(
  registryPath: string,
  toolName: string,
  toolFileName: string
): Promise<void> {
  // Read existing registry
  const existingContent = await fsUtils.readFile(registryPath);

  // Check if tool is already registered
  const importStatement = `import { ${toolName}Tool } from './${toolFileName}.js';`;
  const exportStatement = `  [${toolName}Tool.name]: ${toolName}Tool,`;

  if (existingContent.includes(importStatement)) {
    // Tool already registered
    return;
  }

  // Find the position to insert the import (after last import)
  const lines = existingContent.split('\n');
  let lastImportIndex = -1;
  let toolsObjectStartIndex = -1;
  let toolsObjectEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.startsWith('import ') && line.includes("from './")) {
      lastImportIndex = i;
    }
    if (line.includes('export const tools:') || line.includes('export const tools =')) {
      toolsObjectStartIndex = i;
    }
    if (toolsObjectStartIndex !== -1 && line.includes('};')) {
      toolsObjectEndIndex = i;
      break;
    }
  }

  if (lastImportIndex === -1 || toolsObjectStartIndex === -1 || toolsObjectEndIndex === -1) {
    throw new Error('Could not parse tool registry structure');
  }

  // Insert import after last import
  lines.splice(lastImportIndex + 1, 0, importStatement);

  // Adjust indices after insertion
  toolsObjectEndIndex += 1;

  // Insert export before closing brace
  lines.splice(toolsObjectEndIndex, 0, exportStatement);

  // Write updated content
  const updatedContent = lines.join('\n');
  await fsUtils.writeFile(registryPath, updatedContent, { force: true });
}

/**
 * Add a new tool to an existing MCP server project
 */
export async function addTool(options: AddToolOptions): Promise<GenerationResult> {
  const filesCreated: string[] = [];
  const filesSkipped: string[] = [];

  try {
    // Determine target directory (current directory or specified)
    const targetDir: string = options.projectDir || process.cwd();

    // Verify we're in an MCP server project
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!fsUtils.exists(packageJsonPath)) {
      return {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        error: 'Not in an MCP server project (package.json not found)',
      };
    }

    // Verify tools directory exists
    const toolsDir = path.join(targetDir, 'src', 'mcp', 'tools');
    if (!fsUtils.exists(toolsDir)) {
      return {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        error: 'Tools directory not found (src/mcp/tools)',
      };
    }

    // Generate template variables
    const variables = createTemplateVariables(options);
    const toolFileName = variables.toolName;
    const toolFilePath = path.join(toolsDir, `${toolFileName}.ts`);

    // Check if tool already exists
    if (fsUtils.exists(toolFilePath)) {
      if (options.force) {
        // Overwrite existing tool
        filesSkipped.push(`src/mcp/tools/${toolFileName}.ts`);
      } else {
        return {
          success: false,
          filesCreated: [],
          filesSkipped: [],
          error: `Tool already exists: ${toolFileName}.ts (use --force to overwrite)`,
        };
      }
    }

    // Get tool template path
    const templatePath = getToolTemplatePath();
    if (!fsUtils.exists(templatePath)) {
      return {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        error: `Tool template not found: ${templatePath}`,
      };
    }

    // Render and write tool file
    const result = await templateUtils.copyAndRenderTemplate(
      templatePath,
      toolFilePath,
      variables,
      { force: options.force || false }
    );

    if (result.written) {
      filesCreated.push(`src/mcp/tools/${toolFileName}.ts`);
    } else if (result.skipped) {
      filesSkipped.push(`src/mcp/tools/${toolFileName}.ts`);
    }

    // Update tool registry
    const registryPath = path.join(toolsDir, 'index.ts');
    if (!fsUtils.exists(registryPath)) {
      return {
        success: false,
        filesCreated,
        filesSkipped,
        error: 'Tool registry not found (src/mcp/tools/index.ts)',
      };
    }

    await updateToolRegistry(registryPath, variables.toolName, toolFileName);

    return {
      success: true,
      filesCreated,
      filesSkipped,
    };
  } catch (error) {
    return {
      success: false,
      filesCreated,
      filesSkipped,
      error: (error as Error).message,
    };
  }
}
