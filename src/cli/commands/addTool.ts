/**
 * Add-tool command - Add a new tool to an existing MCP server
 *
 * This command:
 * - Creates a new tool file from template
 * - Registers the tool in the server registry
 * - Handles naming conflicts
 */

import type { ArgumentsCamelCase, Argv } from 'yargs';

interface AddToolOptions {
  name?: string;
  title?: string;
  description?: string;
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
    .example([
      ['$0 add-tool --name myTool', 'Add a tool named myTool'],
      ['$0 add-tool --name calculator --title "Calculator Tool"', 'Add with custom title'],
    ]);
}

export function handler(argv: ArgumentsCamelCase<AddToolOptions>): void {
  // eslint-disable-next-line no-console
  console.log('Add-tool command called with options:');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(argv, null, 2));

  // TODO: Implement in Phase 4 (US2)
  // - Prompt for missing options (name)
  // - Validate tool name (camelCase, no conflicts)
  // - Generate tool file from template
  // - Update tool registry (append import/export)
  // - Handle idempotency (skip or prompt if exists)
  // - Display success message

  // eslint-disable-next-line no-console
  console.log('\n[Placeholder] Add-tool logic will be implemented in Phase 4');
}
