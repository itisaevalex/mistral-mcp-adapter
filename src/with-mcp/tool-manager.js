export class ToolManager {
    constructor() {
        this.tools = new Map();
    }
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        return await tool.execute(args);
    }
    getMistralTools() {
        return Array.from(this.tools.values()).map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: 'object',
                    properties: tool.parameters,
                    required: tool.required, // Comma was missing here
                }, // Closing brace was missing here
            },
        }));
    }
}
//# sourceMappingURL=tool-manager.js.map