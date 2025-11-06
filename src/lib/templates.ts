/**
 * Template engine for rendering files with variable substitution
 *
 * Supports:
 * - Variable substitution using {{variableName}} syntax
 * - Conditional blocks
 * - Template file processing
 * - Multiple preset handling
 */

import path from 'node:path';
import * as fsUtils from './fs.js';

export interface TemplateVariables {
  [key: string]: string | boolean | number | undefined;
}

/**
 * Render a template string by replacing variables
 *
 * Supports:
 * - {{variableName}} - Simple variable substitution
 * - {{variableName|default}} - Variable with default value
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let result = template;

  // Replace {{variable}} or {{variable|default}}
  result = result.replace(
    /\{\{(\w+)(?:\|([^}]+))?\}\}/g,
    (match, varName: string, defaultValue) => {
      const value = variables[varName];

      if (value !== undefined && value !== null) {
        return String(value);
      }

      if (defaultValue !== undefined) {
        return String(defaultValue);
      }

      return match; // Keep original if no value and no default
    }
  );

  return result;
}

/**
 * Render a template file and return the content
 */
export async function renderTemplateFile(
  templatePath: string,
  variables: TemplateVariables
): Promise<string> {
  const content = await fsUtils.readFile(templatePath);
  return renderTemplate(content, variables);
}

/**
 * Process a template directory, rendering all .tmpl files
 *
 * Returns paths of files that were processed (relative to destDir)
 */
export async function processTemplateDir(
  templateDir: string,
  destDir: string,
  _variables: TemplateVariables,
  _options: { force?: boolean } = {}
): Promise<{ filesProcessed: string[]; filesSkipped: string[] }> {
  const filesProcessed: string[] = [];
  const filesSkipped: string[] = [];

  await fsUtils.ensureDir(destDir);

  // Verify template directory exists
  await fsUtils.readFile(templateDir).catch(() => {
    throw new Error(`Template directory not found: ${templateDir}`);
  });

  // For now, we'll implement a simple approach
  // In real implementation, this would recursively process the directory
  // This is a placeholder that will be expanded when templates are created

  return { filesProcessed, filesSkipped };
}

/**
 * Copy and render a single template file
 */
export async function copyAndRenderTemplate(
  templatePath: string,
  destPath: string,
  variables: TemplateVariables,
  options: { force?: boolean } = {}
): Promise<{ written: boolean; skipped: boolean }> {
  // Check if destination exists
  if (fsUtils.exists(destPath) && !options.force) {
    return { written: false, skipped: true };
  }

  // Read and render template
  const content = await renderTemplateFile(templatePath, variables);

  // Remove .tmpl extension from destination if present
  const finalDestPath = destPath.endsWith('.tmpl') ? destPath.slice(0, -5) : destPath;

  // Write rendered content
  return await fsUtils.writeFile(finalDestPath, content, options);
}

/**
 * Get preset-specific template directory
 */
export function getPresetTemplateDir(baseTemplateDir: string, preset: string): string {
  return path.join(baseTemplateDir, 'presets', preset);
}

/**
 * Validate template variables against required keys
 */
export function validateTemplateVariables(
  variables: TemplateVariables,
  requiredKeys: string[]
): { valid: boolean; missingKeys: string[] } {
  const missingKeys = requiredKeys.filter((key) => {
    const value = variables[key];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
}

/**
 * Sanitize a project name for use in templates
 */
export function sanitizeProjectName(name: string): string {
  // Convert to kebab-case and remove invalid characters
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Sanitize a tool name for use in templates
 */
export function sanitizeToolName(name: string): string {
  // Convert to camelCase and remove invalid characters
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Convert a name to PascalCase (for class names)
 */
export function toPascalCase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
