// src/with-universal-mcp/tool-manager.ts
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required?: string[];
  execute: (args: any) => Promise<any>;
}

export interface MistralTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.execute(args);
  }

  getMistralTools(): MistralTool[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters,
          required: tool.required,
        },
      },
    }));
  }

  /**
   * Register a tool from an MCP server
   */
  registerMcpTool(serverId: string, tool: any): void {
    const toolName = tool.name;
    
    // Check if we already have this tool registered
    if (this.tools.has(toolName)) {
      return;
    }
    
    // Register the tool
    this.registerTool({
      name: toolName,
      description: tool.description || `Tool from ${serverId}`,
      parameters: this.convertSchemaToParameters(tool.inputSchema),
      required: this.extractRequiredParameters(tool.inputSchema),
      execute: async () => ({}) // Dummy execute, we'll use MCP server
    });
    
    console.log(`Registered MCP tool: ${toolName} from server: ${serverId}`);
  }

  /**
   * Convert MCP tool schema to Mistral tool parameters
   */
  private convertSchemaToParameters(schema: any): Record<string, any> {
    if (!schema || !schema.properties) {
      return {};
    }
    
    const parameters: Record<string, any> = {};
    
    for (const [key, prop] of Object.entries(schema.properties)) {
      const property = prop as any;
      parameters[key] = {
        type: property.type || 'string',
        description: property.description || `Parameter ${key}`
      };
    }
    
    return parameters;
  }

  /**
   * Extract required parameters from schema
   */
  private extractRequiredParameters(schema: any): string[] {
    if (!schema || !schema.required) {
      return [];
    }
    
    return schema.required as string[];
  }
}