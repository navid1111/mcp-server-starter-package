/**
 * Project generator - Scaffolds a new MCP server project
 *
 * This generator:
 * - Creates project directory structure
 * - Renders and copies template files
 * - Applies variable substitution
 * - Handles preset-specific files
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fsUtils from '../lib/fs.js';
import * as templateUtils from '../lib/templates.js';
import type {
  GenerationResult,
  InitOptions,
  ProjectTemplateVariables,
} from '../types/generators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the absolute path to the templates directory
 */
function getTemplatesDir(): string {
  // Find package root by looking for package.json
  let currentDir = __dirname;

  // Go up until we find package.json or hit root
  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fsUtils.exists(packageJsonPath)) {
      return path.join(currentDir, 'src', 'templates', 'project');
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Hit filesystem root
    }
    currentDir = parentDir;
  }

  // Fallback: assume we're in dist and go up
  return path.join(__dirname, '..', '..', 'src', 'templates', 'project');
}

/**
 * Generate template variables from options
 */
function createTemplateVariables(options: InitOptions): ProjectTemplateVariables {
  return {
    projectName: templateUtils.sanitizeProjectName(options.name),
    projectDescription: options.description || `${options.name} - MCP server`,
    mcpSdkVersion: '^0.5.0',
    withHttpAdapter: options.withHttpAdapter,
    preset: options.preset,
  };
}

/**
 * Define template files to copy
 */
interface TemplateFile {
  src: string;
  dest: string;
  required: boolean;
}

function getTemplateFiles(options: InitOptions): TemplateFile[] {
  const files: TemplateFile[] = [
    { src: 'package.json.tmpl', dest: 'package.json', required: true },
    { src: 'tsconfig.json.tmpl', dest: 'tsconfig.json', required: true },
    { src: 'README.md.tmpl', dest: 'README.md', required: true },
    { src: 'src/server.ts.tmpl', dest: 'src/server.ts', required: true },
    { src: 'src/mcp/tools/echo.ts.tmpl', dest: 'src/mcp/tools/echo.ts', required: true },
    { src: 'src/mcp/tools/index.ts.tmpl', dest: 'src/mcp/tools/index.ts', required: true },
  ];

  // Add preset-specific files
  if (options.preset === 'examples') {
    // Placeholder for examples preset files
    // Will be added in Phase 5 (US3)
  }

  // Add HTTP adapter if requested
  if (options.withHttpAdapter) {
    // Placeholder for HTTP adapter files
    // Will be added in Phase 5 (US3)
  }

  return files;
}

/**
 * Generate a new MCP server project
 */
export async function generateProject(options: InitOptions): Promise<GenerationResult> {
  const filesCreated: string[] = [];
  const filesSkipped: string[] = [];

  try {
    // Determine target directory
    const targetDir = options.targetDir || process.cwd();
    const projectDir = path.join(targetDir, options.name);

    // Check if directory already exists
    if (fsUtils.exists(projectDir)) {
      return {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        error: `Directory already exists: ${projectDir}`,
      };
    }

    // Create project directory
    await fsUtils.ensureDir(projectDir);

    // Get template variables
    const variables = createTemplateVariables(options);

    // Get template files to process
    const templateFiles = getTemplateFiles(options);
    const templatesDir = getTemplatesDir();

    // Process each template file
    for (const file of templateFiles) {
      const srcPath = path.join(templatesDir, file.src);
      const destPath = path.join(projectDir, file.dest);

      // Check if template exists
      if (!fsUtils.exists(srcPath)) {
        if (file.required) {
          throw new Error(`Required template not found: ${srcPath}`);
        }
        continue;
      }

      // Render and write template
      const result = await templateUtils.copyAndRenderTemplate(srcPath, destPath, variables, {
        force: false,
      });

      if (result.written) {
        filesCreated.push(file.dest);
      } else if (result.skipped) {
        filesSkipped.push(file.dest);
      }
    }

    // Create .gitignore
    const gitignoreContent = `node_modules/
dist/
*.log
.env
.DS_Store
`;
    const gitignoreResult = await fsUtils.writeFile(
      path.join(projectDir, '.gitignore'),
      gitignoreContent,
      { force: false }
    );

    if (gitignoreResult.written) {
      filesCreated.push('.gitignore');
    }

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
