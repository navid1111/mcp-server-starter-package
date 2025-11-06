/**
 * Add-tool command - Add a new tool to an existing MCP server
 *
 * This command:
 * - Creates a new tool file from template
 * - Updates the tool registry automatically
 * - Handles idempotency (skips if tool exists)
 */

import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import type { ArgumentsCamelCase, Argv } from 'yargs';
import { addTool } from '../../generators/addTool.js';
import type { AddToolOptions as GeneratorAddToolOptions } from '../../types/generators.js';

interface AddToolOptions {
  name?: string;
  title?: string;
  description?: string;
  force: boolean;
}

export function builder(yargs: Argv) {
  return yargs
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'Tool name (camelCase)',
      demandOption: false,
    })
    .option('title', {
      alias: 't',
      type: 'string',
      description: 'Tool display title',
      demandOption: false,
    })
    .option('description', {
      alias: 'd',
      type: 'string',
      description: 'Tool description',
      demandOption: false,
    })
    .option('force', {
      alias: 'f',
      type: 'boolean',
      default: false,
      description: 'Overwrite tool if it already exists',
    })
    .example([
      ['$0 add-tool --name myTool', 'Add a new tool'],
      [
        '$0 add-tool --name myTool --title "My Tool" --description "Does something"',
        'With metadata',
      ],
      ['$0 add-tool --name myTool --force', 'Overwrite existing tool'],
    ]);
}

export async function handler(argv: ArgumentsCamelCase<AddToolOptions>): Promise<void> {
  try {
    // Prompt for missing required options
    let toolName = argv.name;
    if (!toolName) {
      const rl = readline.createInterface({ input, output });
      toolName = await rl.question('Tool name (camelCase): ');
      rl.close();

      if (!toolName || toolName.trim() === '') {
        // eslint-disable-next-line no-console
        console.error('Error: Tool name is required');
        process.exit(1);
      }
    }

    // Validate tool name (camelCase)
    if (!/^[a-z][a-zA-Z0-9]*$/.test(toolName)) {
      // eslint-disable-next-line no-console
      console.error(
        'Error: Tool name must be camelCase (start with lowercase letter, alphanumeric only)'
      );
      process.exit(1);
    }

    // Build generator options
    const options: GeneratorAddToolOptions = {
      name: toolName,
      title: argv.title,
      description: argv.description,
      force: argv.force,
    };

    // eslint-disable-next-line no-console
    console.log(`\nAdding tool: ${toolName}...`);
    if (options.title) {
      // eslint-disable-next-line no-console
      console.log(`Title: ${options.title}`);
    }
    if (options.description) {
      // eslint-disable-next-line no-console
      console.log(`Description: ${options.description}`);
    }
    // eslint-disable-next-line no-console
    console.log('');

    // Generate the tool
    const result = await addTool(options);

    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(`\nError: ${result.error}`);
      process.exit(1);
    }

    // Display success message
    // eslint-disable-next-line no-console
    console.log(`✓ Tool added successfully!`);

    if (result.filesCreated.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n${result.filesCreated.length} file(s) created:`);
      result.filesCreated.forEach((file) => {
        // eslint-disable-next-line no-console
        console.log(`  - ${file}`);
      });
    }

    if (result.filesSkipped.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n${result.filesSkipped.length} file(s) skipped (already exist):`);
      result.filesSkipped.forEach((file) => {
        // eslint-disable-next-line no-console
        console.log(`  - ${file}`);
      });
    }

    // Next steps
    // eslint-disable-next-line no-console
    console.log(`\nNext steps:`);
    // eslint-disable-next-line no-console
    console.log(`  1. Edit the tool implementation in src/mcp/tools/${toolName}.ts`);
    // eslint-disable-next-line no-console
    console.log(`  2. Define input schema and implement handler logic`);
    // eslint-disable-next-line no-console
    console.log(`  3. Rebuild: npm run build`);
    // eslint-disable-next-line no-console
    console.log(`  4. Test: npm start`);
    // eslint-disable-next-line no-console
    console.log('');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', (error as Error).message);
    process.exit(1);
  }
}
