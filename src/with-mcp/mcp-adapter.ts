// src/with-mcp/mcp-adapter.ts
import { ToolManager } from './tool-manager.js';
import { MistralClient, Message } from './mistral-client.js';
import { Config } from './config.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import * as path from 'path';

// Define the expected structure of toolResult
interface ToolResult {
    content: { type: string; text: string }[];
}

export class McpAdapter {
    private toolManager: ToolManager;
    private client: MistralClient;
    private conversations: Map<string, Message[]> = new Map();
    private config: Config;
    private mcpClient: Client = null!;
    private mcpConnected: boolean = false;

    constructor(config: Config, toolManager: ToolManager) {
        this.toolManager = toolManager;
        this.config = config;
        this.client = new MistralClient(this.config);
        
        // Initialize MCP client and connect to server asynchronously
        this.initializeMcpClient().catch(error => {
            console.error("Failed to initialize MCP client:", error);
        });
    }

    private async initializeMcpClient() {
        try {
            // Path to the compiled server file
            const serverPath = path.join(process.cwd(), 'build/with-mcp/tools/weather-server.js');
            console.log("Connecting to MCP server at:", serverPath);
            
            const transport = new StdioClientTransport({
                command: "node", 
                args: [serverPath]
            });
            
            // Set up error handling
            transport.onmessage = (message) => {
                console.log("Debug - Received message:", JSON.stringify(message).substring(0, 200) + "...");
            };
            
            transport.onerror = (error) => {
                console.error("MCP transport error:", error);
            };
            
            transport.onclose = () => {
                console.log("MCP transport closed");
                this.mcpConnected = false;
            };
            
            // Create the client
            this.mcpClient = new Client({ name: 'MistralMcpClient', version: '1.0.0' });
            
            // Connect to the server
            await this.mcpClient.connect(transport);
            this.mcpConnected = true;
            console.log("Successfully connected to MCP server");
            
            // Test the connection by listing available tools
            const tools = await this.mcpClient.listTools();
            console.log("Available MCP tools:", tools);
            
        } catch (error) {
            console.error("Error connecting to MCP server:", error);
            throw error;
        }
    }
    
    async waitForConnection(timeoutMs: number = 10000): Promise<void> {
        const startTime = Date.now();
        
        while (!this.mcpConnected) {
          if (Date.now() - startTime > timeoutMs) {
            throw new Error(`MCP client connection timed out after ${timeoutMs}ms`);
          }
          
          // Wait a bit and check again
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    async startConversation(): Promise<string> {
        const conversationId = Date.now().toString();
        this.conversations.set(conversationId, []);
        return conversationId;
    }

    async sendMessage(conversationId: string, prompt: string): Promise<string> {
        if (!this.mcpConnected) {
            throw new Error("MCP client is not connected. Call initializeMcpClient() first.");
        }

        let conversation = this.conversations.get(conversationId);
        if (!conversation) {
            conversation = [];
            conversation.push({
                role: 'system', 
                content: "You are a helpful assistant that can use tools. When asked about the weather, use the get_weather tool."
            });
            this.conversations.set(conversationId, conversation);
        }
        
        conversation.push({ role: 'user', content: prompt });
        const tools = this.toolManager.getMistralTools();

        let response = await this.client.chat(conversation, { tools, toolChoice: 'auto' });

        while (response.toolCalls && response.toolCalls.length > 0) {
            console.log(`Received ${response.toolCalls.length} tool calls from Mistral`);

            conversation.push({
                role: 'assistant',
                content: response.content,
                tool_calls: response.toolCalls,
            });

            const toolMessages: Message[] = [];
            for (const toolCall of response.toolCalls) {
                const { id, function: { name, arguments: argsString } } = toolCall;
                console.log(`Processing tool call: ${name} with args: ${argsString}`);

                try {
                    // Parse arguments
                    const argsObject = JSON.parse(argsString);

                    console.log(`Calling MCP tool: ${name}`);
                    const toolResult = await this.mcpClient.callTool({
                        name: name,
                        arguments: argsObject
                    }) as ToolResult;

                    console.log(`Tool ${name} executed successfully. Result:`, toolResult);

                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: id,
                        name: name,
                        content: typeof toolResult.content[0].text === 'string' 
                            ? toolResult.content[0].text 
                            : JSON.stringify(toolResult.content[0].text),
                    });
                } catch (error: any) {
                    console.error(`Error executing tool ${name}:`, error);
                    toolMessages.push({
                        role: 'tool',
                        tool_call_id: id,
                        name: name,
                        content: JSON.stringify({ error: error.message || 'Unknown error' }),
                    });
                }
            }

            conversation.push(...toolMessages);
            response = await this.client.chat(conversation);
        }

        conversation.push({ role: 'assistant', content: response.content });
        this.conversations.set(conversationId, conversation);
        return response.content;
    }

    getConversationHistory(conversationId: string): Message[] {
        return this.conversations.get(conversationId) || [];
    }

    disconnect() {
        if (this.mcpClient && this.mcpConnected) {
            try {
                this.mcpClient.close();
                this.mcpConnected = false;
            } catch (error) {
                console.error("Error disconnecting from MCP server:", error);
            }
        }
    }
}