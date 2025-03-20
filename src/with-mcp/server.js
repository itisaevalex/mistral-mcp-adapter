import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { z } from "zod";
async function startServer() {
    const server = new McpServer({
        name: "DemoServer",
        version: "1.0.0"
    });
    // Tool definition
    server.tool("get_weather", { location: z.string() }, async ({ location }) => ({
        content: [{
                type: "text",
                text: `Weather in ${location}: 72°F, Sunny`
            }]
    }));
    // Resource definition  
    server.resource("user_data", new ResourceTemplate("user://{id}", { list: undefined }), async (uri, { id }) => ({
        contents: [{
                uri: uri.href,
                text: `User ${id}: John Doe, Premium Member`
            }]
    }));
    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
startServer().catch(error => {
    console.error('Failed to start server:', error);
});
//# sourceMappingURL=server.js.map