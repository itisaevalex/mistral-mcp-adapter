// src/test-stdio.ts
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as path from 'path';
import * as fs from 'fs/promises';

async function testStdio() {
    // Create a simple server script that just prints to stdout
    const serverScript = `
        console.log("Hello from the server!");
        process.exit(0); // Exit immediately after printing
    `;

    // Write the server to the build directory
    await fs.writeFile(path.join(process.cwd(), 'build/test-stdio-server.js'), serverScript);

    const transport = new StdioClientTransport({
        command: "node", // Use node executable (adjust if needed)
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
        await transport.start(); // Use start() instead of connect()
        console.log("Stdio transport started.");
        // No need to send anything, the server script prints immediately
    } catch (error) {
        console.error("Error starting transport:", error);
    }
}

testStdio();