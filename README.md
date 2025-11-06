# mcp-server-starter

> Scaffold a ready-to-run Model Context Protocol (MCP) server with a single command

[![npm version](https://badge.fury.io/js/mcp-server-starter.svg)](https://www.npmjs.com/package/mcp-server-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Instant Setup** - Generate a complete MCP server in seconds
- 🛠️ **Easy Tool Management** - Add new tools with automatic registry updates
- 📦 **TypeScript Ready** - Full type safety with strict TypeScript configuration
- ✅ **Production Ready** - Follows MCP specification, works with Claude Desktop
- 🔧 **Zero Config** - Sensible defaults, just start coding your tools
- 🎯 **Developer Friendly** - Interactive prompts, clear error messages

## 🎬 Quick Start

### Create a new MCP server

```bash
npx mcp-server-starter init --name my-awesome-server
cd my-awesome-server
npm install
npm run build
npm start
```

That's it! You now have a working MCP server with a sample echo tool.

## 📚 Usage

### Initialize a new server

```bash
# Interactive mode
npx mcp-server-starter init

# With options
npx mcp-server-starter init --name my-server --preset minimal

# With description
npx mcp-server-starter init --name my-server --description "My custom MCP server"
```

### Add tools to your server

```bash
# Navigate to your server directory
cd my-server

# Add a new tool (interactive)
npx mcp-server-starter add-tool

# Add with options
npx mcp-server-starter add-tool --name calculator --title "Calculator" --description "Performs calculations"

# Force overwrite existing tool
npx mcp-server-starter add-tool --name calculator --force
```

### What gets generated?

```
my-server/
├── package.json          # MCP SDK dependencies included
├── tsconfig.json         # Strict TypeScript config
├── README.md            # Complete documentation
├── .gitignore           # Sensible defaults
└── src/
    ├── server.ts        # MCP server entry point
    └── mcp/
        └── tools/
            ├── index.ts     # Tool registry (auto-updated!)
            └── echo.ts      # Sample tool
```

## 🔌 Connect to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-server/dist/server.js"]
    }
  }
}
```

Restart Claude Desktop, and your tools will be available!

## 🛠️ Tool Development

### Example: Calculator Tool

```typescript
// src/mcp/tools/calculator.ts
import { z } from 'zod';
import type { Tool } from './index.js';

const calculatorInputSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Performs basic math operations',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
      },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
  handler: async (args: unknown) => {
    const input = calculatorInputSchema.parse(args);

    let result: number;
    switch (input.operation) {
      case 'add':
        result = input.a + input.b;
        break;
      case 'subtract':
        result = input.a - input.b;
        break;
      case 'multiply':
        result = input.a * input.b;
        break;
      case 'divide':
        result = input.a / input.b;
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: `Result: ${result}`,
        },
      ],
    };
  },
};
```

Add it to your server:

```bash
npx mcp-server-starter add-tool --name calculator
# Edit src/mcp/tools/calculator.ts with the code above
npm run build
npm start
```

The tool is automatically registered - no manual imports needed!

## 📖 CLI Commands

### `init`

Initialize a new MCP server project.

**Options:**

- `--name, -n` - Project name (kebab-case required)
- `--description, -d` - Project description
- `--preset, -p` - Template preset (`minimal` or `examples`)
- `--with-http-adapter` - Include HTTP transport adapter

**Examples:**

```bash
npx mcp-server-starter init --name my-server
npx mcp-server-starter init --name my-server --preset minimal
npx mcp-server-starter init --name my-server --with-http-adapter
```

### `add-tool`

Add a new tool to an existing MCP server.

**Options:**

- `--name, -n` - Tool name (camelCase required)
- `--title, -t` - Tool display title
- `--description, -d` - Tool description
- `--force, -f` - Overwrite if tool exists

**Examples:**

```bash
npx mcp-server-starter add-tool --name myTool
npx mcp-server-starter add-tool --name calculator --title "Calculator"
npx mcp-server-starter add-tool --name calculator --force
```

## 🎯 Use Cases

Build MCP servers for:

- 🌤️ **Weather APIs** - Get current weather and forecasts
- 🗄️ **Database Operations** - Query, insert, update data
- 📁 **File System** - Read, write, search files
- 🧮 **Calculations** - Math, conversions, computations
- 🌐 **Web Scraping** - Fetch and parse web content
- 📧 **Email** - Send notifications and messages
- 🔍 **Search Engines** - Custom search tools
- 🤖 **Custom APIs** - Integrate any REST API

## 🧪 Testing Your Server

The generated server works with:

- ✅ **Claude Desktop** - Native MCP support
- ✅ **Custom MCP clients** - Using `@modelcontextprotocol/sdk`
- ✅ **OpenAI Function Calling** - With custom integration
- ✅ **Any JSON-RPC client** - Standard stdio transport

## 📋 Requirements

- Node.js >= 18.0.0
- npm or yarn

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © navid1111

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Claude Desktop](https://claude.ai/download)

## 🙏 Acknowledgments

Built with:

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [TypeScript](https://www.typescriptlang.org/)
- [yargs](https://yargs.js.org/)
- [zod](https://zod.dev/)

---

**Made with ❤️ for the MCP community**
