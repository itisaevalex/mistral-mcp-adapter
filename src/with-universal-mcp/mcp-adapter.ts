// src/with-mcp/mcp-adapter.ts
import { ToolManager } from './tool-manager.js';
import { MistralClient, Message } from './mistral-client.js';
import { Config } from './config.js';
import { McpServerManager } from './mcp-server-manager.js';
import { loadMcpConfig } from './config/config-loader.js';

// Define the expected structure of toolResult
interface ToolResult {
    content: { type: string; text: string }[];
}

export class McpAdapter {
    private toolManager: ToolManager;
    private client: MistralClient;
    private conversations: Map<string, Message[]> = new Map();
    private config: Config;
    private serverManager: McpServerManager;

    constructor(config: Config, toolManager: ToolManager, mcpConfigPath?: string) {
        this.toolManager = toolManager;
        this.config = config;
        this.client = new MistralClient(this.config);
        
        // Load MCP configuration
        const mcpConfig = loadMcpConfig(mcpConfigPath);
        this.serverManager = new McpServerManager(mcpConfig);
        
        // Initialize MCP servers
        this.initializeServers().catch(error => {
            console.error("Failed to initialize MCP servers:", error);
        });
    }

    private async initializeServers(): Promise<void> {
        await this.serverManager.initializeServers();
    }

    async waitForConnection(serverId?: string, timeoutMs: number = 10000): Promise<void> {
        await this.serverManager.waitForConnection(serverId, timeoutMs);
    }

    async startConversation(): Promise<string> {
        const conversationId = Date.now().toString();
        this.conversations.set(conversationId, []);
        return conversationId;
    }

    async sendMessage(conversationId: string, prompt: string): Promise<string> {
        if (!this.serverManager.isServerConnected()) {
            throw new Error("MCP server is not connected. Please wait for initialization to complete.");
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
        
        // Get all available tools from all servers
        const serverTools = await this.serverManager.getAllTools();

        // Add this debug logging here
        console.log(`Available tools from all servers:`, 
        Object.entries(serverTools).map(([id, tools]) => 
            `${id}: ${tools.map(t => t.name).join(', ')}`).join('; ')
        );

        // Prepare tools for Mistral
        const tools = this.toolManager.getMistralTools();
        
        // Add tools from MCP servers
        for (const [serverId, serverToolList] of Object.entries(serverTools)) {
            for (const tool of serverToolList) {
                // Register the tool with the tool manager using the server ID as prefix
                this.toolManager.registerMcpTool(serverId, tool);
            }
        }
        
        // Get the updated tool list
        const updatedTools = this.toolManager.getMistralTools();
        
        let response = await this.client.chat(conversation, { tools: updatedTools, toolChoice: 'auto' });

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
                    
                    // Determine which server to use based on the tool name
                    // For now, use the default server
                    console.log(`Calling MCP tool: ${name}`);
                    const toolResult = await this.serverManager.callTool(
                        name, 
                        argsObject
                    ) as ToolResult;

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
        this.serverManager.disconnectAll();
    }
}