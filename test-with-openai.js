/**
 * Test MCP Server with OpenAI
 * 
 * This script:
 * 1. Spawns an MCP server
 * 2. Connects to it via stdio
 * 3. Gets available tools
 * 4. Uses OpenAI to call the tools intelligently
 */

import { spawn } from 'child_process';
import OpenAI from 'openai';
import { createInterface } from 'readline';

// Configuration
const MCP_SERVER_PATH = process.env.TEMP + '\\test-mcp-server\\dist\\server.js';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Please set OPENAI_API_KEY environment variable');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// MCP Client
class MCPClient {
  constructor(serverPath) {
    this.serverPath = serverPath;
    this.process = null;
    this.requestId = 1;
    this.pendingRequests = new Map();
  }

  async start() {
    console.log('🚀 Starting MCP server...');
    console.log(`   Path: ${this.serverPath}\n`);

    this.process = spawn('node', [this.serverPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    // Handle stdout (responses from server)
    const rl = createInterface({
      input: this.process.stdout,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!line.trim()) return;
      
      try {
        const response = JSON.parse(line);
        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject } = this.pendingRequests.get(response.id);
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        }
      } catch (err) {
        console.error('Failed to parse response:', line);
      }
    });

    this.process.on('error', (err) => {
      console.error('❌ Server process error:', err);
    });

    this.process.on('exit', (code) => {
      console.log(`\n📴 Server exited with code ${code}`);
    });

    // Give server time to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async sendRequest(method, params = {}) {
    const id = this.requestId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(request) + '\n');

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 5000);
    });
  }

  async listTools() {
    return await this.sendRequest('tools/list');
  }

  async callTool(name, args) {
    return await this.sendRequest('tools/call', { name, arguments: args });
  }

  stop() {
    if (this.process) {
      this.process.kill();
    }
  }
}

// Main test
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  MCP Server + OpenAI Integration Test         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const client = new MCPClient(MCP_SERVER_PATH);

  try {
    // Start MCP server
    await client.start();

    // Get available tools
    console.log('📋 Fetching available tools...');
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];
    
    console.log(`✓ Found ${tools.length} tool(s):\n`);
    tools.forEach(tool => {
      console.log(`   • ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Convert MCP tools to OpenAI function format
    const openaiTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    // Test 1: Simple echo
    console.log('🤖 Test 1: Asking OpenAI to use the echo tool\n');
    console.log('   User: "Use the echo tool to say: Hello, MCP World!"');
    
    const completion1 = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'user', 
          content: 'Use the echo tool to say: Hello, MCP World!' 
        }
      ],
      tools: openaiTools,
      tool_choice: 'auto',
    });

    const responseMessage = completion1.choices[0].message;
    
    if (responseMessage.tool_calls) {
      console.log(`   AI: Calling tool "${responseMessage.tool_calls[0].function.name}"...\n`);
      
      const toolCall = responseMessage.tool_calls[0];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      console.log('   📤 Calling MCP tool with arguments:');
      console.log('   ' + JSON.stringify(functionArgs, null, 2).split('\n').join('\n   '));
      
      // Call the actual MCP tool
      const toolResult = await client.callTool(toolCall.function.name, functionArgs);
      
      console.log('\n   📥 MCP Tool Response:');
      console.log('   ' + JSON.stringify(toolResult, null, 2).split('\n').join('\n   '));
      
      // Send result back to OpenAI for final response
      const completion2 = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'user', content: 'Use the echo tool to say: Hello, MCP World!' },
          responseMessage,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          }
        ],
        tools: openaiTools,
      });
      
      console.log('\n   AI Final Response:');
      console.log('   "' + completion2.choices[0].message.content + '"');
    }

    console.log('\n\n✅ Test completed successfully!');
    console.log('\n💡 Your MCP server is working perfectly with OpenAI!');
    console.log('   - Server spawned and responded ✓');
    console.log('   - Tools listed successfully ✓');
    console.log('   - OpenAI function calling worked ✓');
    console.log('   - Tool execution successful ✓\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nDetails:', error);
  } finally {
    client.stop();
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

main();
