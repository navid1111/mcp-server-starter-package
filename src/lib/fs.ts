/**
 * Filesystem utilities for idempotent operations
 *
 * These utilities ensure safe file operations during project scaffolding:
 * - Idempotent writes (don't overwrite unless forced)
 * - Safe copy operations
 * - Directory creation with proper error handling
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Check if a file or directory exists
 */
export function exists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
    }
  }
}

/**
 * Write content to a file (idempotent - skips if exists unless force=true)
 */
export async function writeFile(
  filePath: string,
  content: string,
  options: { force?: boolean } = {}
): Promise<{ written: boolean; skipped: boolean }> {
  const fileExists = exists(filePath);

  if (fileExists && !options.force) {
    return { written: false, skipped: true };
  }

  // Ensure parent directory exists
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { written: true, skipped: false };
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Copy a file from source to destination
 */
export async function copyFile(
  src: string,
  dest: string,
  options: { force?: boolean } = {}
): Promise<{ copied: boolean; skipped: boolean }> {
  const destExists = exists(dest);

  if (destExists && !options.force) {
    return { copied: false, skipped: true };
  }

  // Ensure parent directory exists
  const dir = path.dirname(dest);
  await ensureDir(dir);

  try {
    await fs.copyFile(src, dest);
    return { copied: true, skipped: false };
  } catch (error) {
    throw new Error(`Failed to copy file from ${src} to ${dest}: ${(error as Error).message}`);
  }
}

/**
 * Copy a directory recursively
 */
export async function copyDir(
  src: string,
  dest: string,
  options: { force?: boolean } = {}
): Promise<{ filesProcessed: number; filesSkipped: number }> {
  let filesProcessed = 0;
  let filesSkipped = 0;

  await ensureDir(dest);

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const result = await copyDir(srcPath, destPath, options);
      filesProcessed += result.filesProcessed;
      filesSkipped += result.filesSkipped;
    } else {
      const result = await copyFile(srcPath, destPath, options);
      if (result.copied) {
        filesProcessed++;
      } else if (result.skipped) {
        filesSkipped++;
      }
    }
  }

  return { filesProcessed, filesSkipped };
}

/**
 * Append content to a file (for registry updates)
 */
export async function appendToFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.appendFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to append to file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
