// src/mcp-adapter.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from "@modelcontextprotocol/sdk/types";
import { Config } from './config';
import { MistralClient, Message } from './mistral-client';

// Export the class so it can be imported in index.ts
export class MistralMcpAdapter {
  private server: Server;
  private mistralClient: MistralClient;
  private conversations: Map<string, Array<Message>> = new Map();

  constructor(config: Config) {
    // Initialize Mistral client
    this.mistralClient = new MistralClient(config);

    // Initialize MCP server
    this.server = new Server({
      name: "mistral-mcp",
      version: "1.0.0",
      description: "Simple MCP adapter for Mistral AI"
    });
    
    // Register handlers
    this.setupHandlers();
  }

  private setupHandlers() {
    // Define available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "chat",
            description: "Chat with Mistral AI models",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "The message to send to Mistral"
                },
                conversation_id: {
                  type: "string",
                  description: "Conversation ID for context"
                },
                temperature: {
                  type: "number",
                  description: "Temperature (0-1)"
                }
              },
              required: ["prompt"]
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (request.params.name === "chat") {
          const params = request.params.arguments as {
            prompt: string;
            conversation_id?: string;
            temperature?: number;
          };
          if (!params?.prompt) {
            throw new McpError(ErrorCode.InvalidParams, "Missing required parameter: prompt");
          }

          // Get or create conversation history
          const conversationId = params.conversation_id || 'default';
          let conversation = this.conversations.get(conversationId) || [];
          
          // Add system message if this is a new conversation
          if (conversation.length === 0) {
            conversation.push({
              role: 'system',
              content: 'You are a helpful assistant powered by Mistral AI.'
            });
          }
          
          // Add user message to conversation
          conversation.push({
            role: 'user',
            content: params.prompt
          });
          
          console.error(`Sending request to Mistral API...`);
          
          try {
            // Call Mistral API with current conversation
            const response = await this.mistralClient.chat(conversation, {
              temperature: params.temperature
            });
            
            // Add assistant response to conversation history
            conversation.push({
              role: 'assistant',
              content: response.content
            });
            
            // Update conversation history
            this.conversations.set(conversationId, conversation);
            
            console.error(`Response received from Mistral`);
            
            // Return properly formatted response for MCP
            return {
              result: {
                content: response.content,
                model: response.model,
                usage: response.usage,
                conversation_id: conversationId
              }
            };
          } catch (apiError: unknown) {
            console.error(`API error:`, apiError);
            throw new McpError(
              ErrorCode.InternalError, 
              `Mistral API error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
            );
          }
        }
       
        throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
      } catch (error: unknown) {
        if (error instanceof McpError) {
          throw error;
        }
       
        console.error("Error in tool execution:", error);
        throw new McpError(ErrorCode.InternalError, `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("✅ Mistral MCP Adapter running on stdio");
    } catch (error) {
      console.error("Failed to start MCP server:", error);
      throw error;
    }
  }
}