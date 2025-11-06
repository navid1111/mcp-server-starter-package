#!/usr/bin/env node

/**
 * MCP Server Starter CLI
 *
 * Entry point for the command-line interface using yargs.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as addToolCommand from './commands/addTool.js';
import * as initCommand from './commands/init.js';

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('mcp-server-starter')
    .usage('$0 <command> [options]')
    .command(
      'init',
      'Initialize a new MCP server project',
      initCommand.builder,
      initCommand.handler
    )
    .command(
      'add-tool',
      'Add a new tool to an existing MCP server',
      addToolCommand.builder,
      addToolCommand.handler
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
