// src/with-mcp/test-tool-agent.ts
import { loadConfig } from './config.js';
import { McpAdapter } from './mcp-adapter.js'; // Import McpAdapter
import { ToolManager } from './tool-manager.js';
import { MistralClient } from './mistral-client.js'; // Add .js extension

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function testMcpAgent() {
    try {
      const config = loadConfig();
  
      // Create tool manager and register the weather tool for Mistral
      const toolManager = new ToolManager();
      toolManager.registerTool({
        name: 'get_weather',
        description: 'Gets the weather for a given location.',
        parameters: { 
          location: { 
            type: 'string', 
            description: 'The location to get the weather for.' 
          } 
        },
        required: ['location'],
        execute: async () => ({}) // Dummy execute, we'll use MCP server
      });
  
      console.log("Creating MCP adapter...");
      const mcpAdapter = new McpAdapter(config, toolManager);
  
      // Wait for MCP client to connect
      console.log("Waiting for MCP client to connect...");
      await mcpAdapter.waitForConnection();
      console.log("MCP client connected, starting test...");
  
      // Start conversation
      const conversationId = await mcpAdapter.startConversation();
  
      // Test with a weather query
      const prompt1 = "What's the weather like in London?";
      console.log(`User: ${prompt1}`);
      const response1 = await mcpAdapter.sendMessage(conversationId, prompt1);
      console.log(`Agent: ${response1}`);
  
      // Test with another weather query
      const prompt2 = "What's the weather like in Paris?";
      console.log(`User: ${prompt2}`);
      const response2 = await mcpAdapter.sendMessage(conversationId, prompt2);
      console.log(`Agent: ${response2}`);
  
      // Show conversation history
      console.log("\nConversation History:");
      const history = mcpAdapter.getConversationHistory(conversationId);
      for (const message of history) {
        if (message.role === 'tool') {
          console.log(`${message.role} (${message.name}): ${message.content}`);
        } else {
          console.log(`${message.role}: ${message.content.substring(0, 100)}...`);
        }
      }
  
      // Disconnect
      mcpAdapter.disconnect();
      console.log("Test completed successfully");
  
    } catch (error) {
      console.error('Error testing MCP agent:', error);
    }
  }
  
  testMcpAgent();