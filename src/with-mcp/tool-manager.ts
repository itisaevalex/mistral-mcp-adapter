// src/with-tools/tool-manager.ts
import { MistralTool } from './mcp-types.js'; // Import from mcp-types

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>; // Simplified parameters
  required?: string[];
  execute: (args: any) => Promise<any>;
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

  getMistralTools(): MistralTool[] { // Return MistralTool[]
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: { // Simplified, you might need more complex conversion
          type: 'object',
          properties: tool.parameters,
          required: tool.required, // Comma was missing here
        }, // Closing brace was missing here
      },
    }));
  }
}