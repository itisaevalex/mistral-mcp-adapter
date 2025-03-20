// src/with-mcp/mcp-adapter.ts
import { ToolManager } from './tool-manager.js';
import { MistralClient, Message } from './mistral-client.js';
import { Config } from './config.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js'; // Import the higher-level Client
import { MistralTool } from './mcp-types.js';

// Define the expected structure of toolResult
interface ToolResult {
    content: { text: string }[];
}

export class McpAdapter {
    private toolManager: ToolManager;
    private client: MistralClient;
    private conversations: Map<string, Message[]> = new Map();
    private config: Config;
    private mcpClient: Client; // Use the higher-level Client

    constructor(config: Config, toolManager: ToolManager) {
        this.toolManager = toolManager;
        this.config = config;
        this.client = new MistralClient(this.config);

        // Initialize the MCP client.  The 'command' and 'args' are crucial
        // for StdioClientTransport to know how to *start* the server.
        const transport = new StdioClientTransport({
            command: "C:\\nvm4w\\nodejs\\npx.cmd", // VERY IMPORTANT: Use double backslashes in the path
            args: [
                "C:\\nvm4w\\nodejs\\npx.cmd", // Full path to npx.cmd
                'ts-node',
                'src/with-mcp/tools/mcp-server.ts'
            ],
        });

        this.mcpClient = new Client(
            { name: 'MistralMcpClient', version: '1.0.0' },
            { capabilities: { tools: {}, resources: {}, prompts:{} } } // You might define capabilities later
        );
        this.mcpClient.connect(transport); //Connect with std transport

    }

    async startConversation(): Promise<string> {
        const conversationId = Date.now().toString();
        this.conversations.set(conversationId, []);
        return conversationId;
    }

    async sendMessage(conversationId: string, prompt: string): Promise<string> {
        let conversation = this.conversations.get(conversationId);
        if (!conversation) {
            conversation = [];
             // Optionally add a system message at the start of *new* conversations.
            conversation.push({role: 'system', content: "You are a helpful assistant that can use tools."})
            this.conversations.set(conversationId, conversation);
        }
        conversation.push({ role: 'user', content: prompt });
        const tools = this.toolManager.getMistralTools();

        let response = await this.client.chat(conversation, { tools, toolChoice: 'auto' });

        while (response.toolCalls && response.toolCalls.length > 0) {
            console.log(`Received ${response.toolCalls.length} tool calls`);

            conversation.push({
                role: 'assistant',
                content: response.content,
                tool_calls: response.toolCalls, //Very important
            });

            const toolMessages: Message[] = [];
            for (const toolCall of response.toolCalls) {
                const { id, function: { name, arguments: argsString } } = toolCall;
                 console.log(`Processing tool call: ${name}`);

                try {
                    // Parse the arguments string into an object
                    const argsObject = JSON.parse(argsString);

                    // Ensure argsObject matches the expected structure
                    const toolResult = await this.mcpClient.callTool({
                        name: name,
                        arguments: argsObject
                    }) as ToolResult;

                    console.log(`Tool ${name} executed successfully (via MCP). Result:`, toolResult);

                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: id,
                        name: name,
                        content: JSON.stringify(toolResult.content[0].text),  // Extract text content, and stringify the object
                    });

                } catch (error: any) {
                    console.error(`Error executing tool ${name}:`, error);
                    // Send an error message back as the tool result.
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: id,
                        name: name,
                        content: JSON.stringify({ error: error.message || 'Unknown error' }),
                    });
                }
            }

            conversation.push(...toolMessages);
            response = await this.client.chat(conversation); //Next call
        }

        conversation.push({ role: 'assistant', content: response.content });
        this.conversations.set(conversationId, conversation);
        return response.content;
    }


    getConversationHistory(conversationId: string): Message[] {
        return this.conversations.get(conversationId) || [];
    }

    disconnect() {
        this.mcpClient.close(); // Use the close() method of the higher-level Client
    }
}