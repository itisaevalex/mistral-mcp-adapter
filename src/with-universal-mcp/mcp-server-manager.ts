// src/with-mcp/mcp-server-manager.ts
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpConfig, McpServerConfig } from './config/mcp-config.js';
import * as childProcess from 'child_process';

export interface McpServerInstance {
  id: string;
  config: McpServerConfig;
  client: Client;
  connected: boolean;
}

export class McpServerManager {
  private servers: Map<string, McpServerInstance> = new Map();
  private config: McpConfig;

  constructor(config: McpConfig) {
    this.config = config;
  }

  /**
   * Initialize all servers defined in configuration
   */
  async initializeServers(): Promise<void> {
    // Initialize all configured servers
    for (const [id, serverConfig] of Object.entries(this.config.servers)) {
      await this.initializeServer(id, serverConfig);
    }
  }

  /**
   * Initialize a specific server by ID
   */
  async initializeServer(id: string, config: McpServerConfig): Promise<McpServerInstance> {
    console.log(`Initializing MCP server: ${id}`);

    if (this.servers.has(id)) {
      return this.servers.get(id)!;
    }

    let transport;
    
    // Create appropriate transport based on type
    if (config.type === 'stdio') {
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env
      });
      
      transport.onmessage = (message) => {
        console.log(`[Debug] Message from ${id}:`, JSON.stringify(message).substring(0, 200) + '...');
      };

    } else if (config.type === 'sse') {
      // SSE transport would be implemented here
      throw new Error('SSE transport not yet implemented');
    } else {
      throw new Error(`Unsupported transport type: ${config.type}`);
    }
    
    // Setup event handlers
    transport.onerror = (error) => {
      console.error(`MCP server ${id} error:`, error);
    };
    
    transport.onclose = () => {
      console.log(`MCP server ${id} connection closed`);
      const server = this.servers.get(id);
      if (server) {
        server.connected = false;
      }
    };
    
    // Create client
    const client = new Client({ 
      name: `MistralMcpClient-${id}`, 
      version: '1.0.0' 
    });
    
    // Create server instance
    const serverInstance: McpServerInstance = {
      id,
      config,
      client,
      connected: false
    };
    
    // Store the instance
    this.servers.set(id, serverInstance);
    
    // Connect to the server
    try {
      await client.connect(transport);
      serverInstance.connected = true;
      console.log(`Successfully connected to MCP server: ${id}`);
      
      // List available tools
      const tools = await client.listTools();
      console.log(`Available tools on ${id}:`, JSON.stringify(tools, null, 2));
    } catch (error) {
      console.error(`Failed to connect to MCP server ${id}:`, error);
      throw error;
    }
    
    return serverInstance;
  }

  /**
   * Get a server instance by ID
   */
  getServer(id?: string): McpServerInstance {
    const serverId = id || this.config.defaultServer;
    
    if (!serverId) {
      throw new Error('No server ID specified and no default server configured');
    }
    
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`MCP server "${serverId}" not found`);
    }
    
    return server;
  }

  /**
   * Check if a server is connected
   */
  isServerConnected(id?: string): boolean {
    try {
      const server = this.getServer(id);
      return server.connected;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for a server to be connected
   */
  async waitForConnection(id?: string, timeoutMs: number = 10000): Promise<void> {
    const serverId = id || this.config.defaultServer;
    
    if (!serverId) {
      throw new Error('No server ID specified and no default server configured');
    }
    
    const startTime = Date.now();
    
    while (!this.isServerConnected(serverId)) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`MCP server ${serverId} connection timed out after ${timeoutMs}ms`);
      }
      
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Disconnect all servers
   */
  disconnectAll(): void {
    for (const [id, server] of this.servers.entries()) {
      try {
        server.client.close();
        server.connected = false;
        console.log(`Disconnected from MCP server: ${id}`);
      } catch (error) {
        console.error(`Error disconnecting from MCP server ${id}:`, error);
      }
    }
  }

  /**
   * Get all available tools across all servers
   */
  async getAllTools(): Promise<Record<string, any[]>> {
    const allTools: Record<string, any[]> = {};
    
    for (const [id, server] of this.servers.entries()) {
      if (server.connected) {
        try {
          const tools = await server.client.listTools();
          allTools[id] = tools.tools;
        } catch (error) {
          console.error(`Error getting tools from ${id}:`, error);
          allTools[id] = [];
        }
      }
    }
    
    return allTools;
  }

  /**
   * Call a tool on a specific server
   */
  async callTool(toolName: string, args: any, serverId?: string): Promise<any> {
    // If serverId is not provided, we need to determine which server has this tool
    if (!serverId) {
      // Create a map of tool name to server ID based on our getAllTools results
      const toolToServerMap = new Map<string, string>();
      const allTools = await this.getAllTools();
      
      for (const [serverId, tools] of Object.entries(allTools)) {
        for (const tool of tools) {
          toolToServerMap.set(tool.name, serverId);
        }
      }
      
      // Find the server for this tool
      const toolServerId = toolToServerMap.get(toolName);
      if (toolServerId) {
        console.log(`Found tool ${toolName} on server ${toolServerId}`);
        return this.callTool(toolName, args, toolServerId);
      }
      
      // If we can't find the server, try all of them as a fallback
      console.log(`No specific server found for tool ${toolName}, trying all servers`);
      for (const [id, server] of this.servers.entries()) {
        if (server.connected) {
          try {
            console.log(`Attempting to call ${toolName} on server ${id}`);
            return await server.client.callTool({
              name: toolName,
              arguments: args
            });
          } catch (error: unknown) {
            console.log(`Error calling ${toolName} on server ${id}:`, error);
            // Only rethrow if it's not a "not found" error
            if (error instanceof Error && !error.message.includes('not found')) {
              throw error;
            }
          }
        }
      }
      
      throw new Error(`Tool ${toolName} not found on any server`);
    } else {
      // If serverId is provided, use that specific server
      const server = this.getServer(serverId);
      if (!server.connected) {
        throw new Error(`Server ${serverId} is not connected`);
      }
      
      console.log(`Calling tool ${toolName} on specified server ${serverId}`);
      return await server.client.callTool({
        name: toolName,
        arguments: args
      });
    }
  }
}