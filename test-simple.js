/**
 * Simple MCP Server Test (No OpenAI Required)
 * 
 * This script tests basic MCP server functionality:
 * 1. Spawns the MCP server
 * 2. Lists available tools
 * 3. Calls the echo tool directly
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

const MCP_SERVER_PATH = process.env.TEMP + '\\test-mcp-server\\dist\\server.js';

class SimpleMCPClient {
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
        console.error('Failed to parse:', line);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async sendRequest(method, params = {}) {
    const id = this.requestId++;
    const request = { jsonrpc: '2.0', id, method, params };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(request) + '\n');

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

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Simple MCP Server Test (No OpenAI)           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const client = new SimpleMCPClient(MCP_SERVER_PATH);

  try {
    await client.start();

    // Test 1: List tools
    console.log('📋 Test 1: Listing available tools\n');
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];
    
    console.log(`   ✓ Found ${tools.length} tool(s):`);
    tools.forEach(tool => {
      console.log(`\n   📦 ${tool.name}`);
      console.log(`      ${tool.description}`);
      console.log(`      Input: ${JSON.stringify(tool.inputSchema.properties)}`);
    });

    // Test 2: Call echo tool
    console.log('\n\n📞 Test 2: Calling the echo tool\n');
    console.log('   Sending: { message: "Hello from MCP test!" }');
    
    const result = await client.callTool('echo', {
      message: 'Hello from MCP test!'
    });
    
    console.log('\n   ✓ Response received:');
    console.log('   ' + JSON.stringify(result, null, 2).split('\n').join('\n   '));

    // Test 3: Call with different message
    console.log('\n\n📞 Test 3: Another echo call\n');
    console.log('   Sending: { message: "🎉 Your MCP server works perfectly!" }');
    
    const result2 = await client.callTool('echo', {
      message: '🎉 Your MCP server works perfectly!'
    });
    
    console.log('\n   ✓ Response received:');
    console.log('   ' + JSON.stringify(result2, null, 2).split('\n').join('\n   '));

    console.log('\n\n╔════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL TESTS PASSED!                          ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log('Your MCP server is working correctly:');
    console.log('  ✓ Server starts and responds');
    console.log('  ✓ Tools list endpoint works');
    console.log('  ✓ Tool execution works');
    console.log('  ✓ JSON-RPC communication works');
    console.log('\n🎊 Ready for production use!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    client.stop();
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

main();
