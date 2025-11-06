/**
 * Init command - Initialize a new MCP server project
 *
 * This command scaffolds a new MCP server with:
 * - Project structure
 * - Sample tools
 * - Optional integrations
 * - Configuration files
 */

import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import type { ArgumentsCamelCase, Argv } from 'yargs';
import { generateProject } from '../../generators/project.js';
import type { InitOptions as GeneratorInitOptions } from '../../types/generators.js';

interface InitOptions {
  name?: string;
  description?: string;
  preset: 'minimal' | 'examples';
  withHttpAdapter: boolean;
}

export function builder(yargs: Argv) {
  return yargs
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'Project name (kebab-case)',
      demandOption: false,
    })
    .option('description', {
      alias: 'd',
      type: 'string',
      description: 'Project description',
      demandOption: false,
    })
    .option('preset', {
      alias: 'p',
      type: 'string',
      choices: ['minimal', 'examples'] as const,
      default: 'minimal' as const,
      description: 'Project preset template',
    })
    .option('with-http-adapter', {
      type: 'boolean',
      default: false,
      description: 'Include optional HTTP adapter',
    })
    .example([
      ['$0 init --name my-mcp-server', 'Create a minimal server'],
      ['$0 init --name my-server --preset examples', 'Create with example tools'],
      ['$0 init --with-http-adapter', 'Create with HTTP adapter'],
    ]);
}

export async function handler(argv: ArgumentsCamelCase<InitOptions>): Promise<void> {
  try {
    // Prompt for missing required options
    let projectName = argv.name;
    if (!projectName) {
      const rl = readline.createInterface({ input, output });
      projectName = await rl.question('Project name (kebab-case): ');
      rl.close();

      if (!projectName || projectName.trim() === '') {
        // eslint-disable-next-line no-console
        console.error('Error: Project name is required');
        process.exit(1);
      }
    }

    // Validate project name
    if (!/^[a-z0-9-]+$/.test(projectName)) {
      // eslint-disable-next-line no-console
      console.error(
        'Error: Project name must be kebab-case (lowercase letters, numbers, and hyphens only)'
      );
      process.exit(1);
    }

    // Build generator options
    const options: GeneratorInitOptions = {
      name: projectName,
      description: argv.description,
      preset: argv.preset,
      withHttpAdapter: argv.withHttpAdapter,
    };

    // eslint-disable-next-line no-console
    console.log(`\nGenerating MCP server project: ${projectName}...`);
    // eslint-disable-next-line no-console
    console.log(`Preset: ${options.preset}`);
    if (options.withHttpAdapter) {
      // eslint-disable-next-line no-console
      console.log('HTTP adapter: enabled');
    }
    // eslint-disable-next-line no-console
    console.log('');

    // Generate the project
    const result = await generateProject(options);

    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(`\nError: ${result.error}`);
      process.exit(1);
    }

    // Display success message
    // eslint-disable-next-line no-console
    console.log(`✓ Project created successfully!`);
    // eslint-disable-next-line no-console
    console.log(`\n${result.filesCreated.length} files created:`);
    result.filesCreated.forEach((file) => {
      // eslint-disable-next-line no-console
      console.log(`  - ${file}`);
    });

    if (result.filesSkipped.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n${result.filesSkipped.length} files skipped (already exist):`);
      result.filesSkipped.forEach((file) => {
        // eslint-disable-next-line no-console
        console.log(`  - ${file}`);
      });
    }

    // Next steps
    // eslint-disable-next-line no-console
    console.log(`\nNext steps:`);
    // eslint-disable-next-line no-console
    console.log(`  cd ${projectName}`);
    // eslint-disable-next-line no-console
    console.log(`  npm install`);
    // eslint-disable-next-line no-console
    console.log(`  npm run build`);
    // eslint-disable-next-line no-console
    console.log(`  npm start`);
    // eslint-disable-next-line no-console
    console.log('');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', (error as Error).message);
    process.exit(1);
  }
}
