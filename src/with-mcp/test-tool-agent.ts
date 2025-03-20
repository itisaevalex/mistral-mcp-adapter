// src/with-mcp/test-tool-agent.ts
import { loadConfig } from './config';
import { McpAdapter } from './mcp-adapter'; // Import McpAdapter
import { ToolManager } from './tool-manager';

async function testMcpAgent() {
    try {
        const config = loadConfig();

        // IMPORTANT:  The ToolManager is now ONLY used for Mistral, NOT for
        // executing the tools directly.  The MCP server handles that.
        const toolManager = new ToolManager();
        toolManager.registerTool({ //Register tool for Mistral
            name: 'get_weather',
            description: 'Gets the weather for a given location.',
            parameters: { location: { type: 'string', description: 'The location to get the weather for.' } },
            required: ['location'],
            execute: async (args) => { return {} } // Dummy execute, will not be used.
        });


        const mcpAdapter = new McpAdapter(config, toolManager); // Use McpAdapter

        const conversationId = await mcpAdapter.startConversation();

        const prompt1 = "What's the weather like in London?";
        console.log(`User: ${prompt1}`);
        const response1 = await mcpAdapter.sendMessage(conversationId, prompt1);
        console.log(`Agent: ${response1}`);

        const prompt2 = "What's the weather like in Paris?";
        console.log(`User: ${prompt2}`);
        const response2 = await mcpAdapter.sendMessage(conversationId, prompt2);
        console.log(`Agent: ${response2}`);

         console.log("\nConversation History:");
        const history = mcpAdapter.getConversationHistory(conversationId);
        history.forEach((message) => {
            console.log(`${message.role}: ${message.content}`);
        });

        mcpAdapter.disconnect();


    } catch (error) {
        console.error('Error testing MCP agent:', error);
    }
}

testMcpAgent();