// src/test-stdio.ts
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import * as fs from 'fs/promises';

async function testStdio() {
    // Create a simple server script that outputs valid JSON-RPC formatted messages
    const serverScript = `
        // Output a valid JSON-RPC message
        console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: '1',
            result: {
                message: 'Hello from the MCP server!'
            }
        }));
        
        // Wait a moment before exiting to ensure the message is sent
        setTimeout(() => process.exit(0), 100);
    `;

    // Write the server to the build directory
    await fs.writeFile(path.join(process.cwd(), 'build/test-stdio-server.js'), serverScript);

    const transport = new StdioClientTransport({
        command: "node",
        args: [path.join(process.cwd(), 'build/test-stdio-server.js')],
    });

    // Use the correct event handlers: onmessage, onerror, onclose
    transport.onmessage = (message) => {
        console.log("Received message:", message);
    };

    transport.onerror = (error) => {
        console.error("Transport error:", error);
    };

    transport.onclose = () => {
        console.log("Transport closed.");
    };

    try {
        await transport.start();
        console.log("Stdio transport started.");
    } catch (error) {
        console.error("Error starting transport:", error);
    }
}

testStdio();