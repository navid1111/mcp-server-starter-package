#!/usr/bin/env node

/**
 * MCP Server Starter CLI
 *
 * Entry point for the command-line interface using yargs.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Commands will be imported here
// import { initCommand } from './commands/init.js';
// import { addToolCommand } from './commands/addTool.js';

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('mcp-server-starter')
    .usage('$0 <command> [options]')
    .command(
      'init',
      'Initialize a new MCP server project',
      () => {},
      () => {
        // eslint-disable-next-line no-console
        console.log('Init command - placeholder (will be implemented in next task)');
      }
    )
    .command(
      'add-tool',
      'Add a new tool to an existing MCP server',
      () => {},
      () => {
        // eslint-disable-next-line no-console
        console.log('Add-tool command - placeholder (will be implemented in next task)');
      }
    )
    .demandCommand(1, 'You must provide a command')
    .help('h')
    .alias('h', 'help')
    .version('0.1.0')
    .alias('v', 'version')
    .strict()
    .parse();
}

main().catch((error: Error) => {
  // eslint-disable-next-line no-console
  console.error('Error:', error.message);
  process.exit(1);
});
