// src/test-stdio.ts
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import path from 'path';
async function testStdio() {
    // Create a simple server script (server.js) that just prints to stdout
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const serverFilePath = path.join(__dirname, 'server.js');
    const serverScript = `
        console.log("Hello from the server!");
        process.exit(0); // Exit immediately after printing
    `;
    // Write the server to the build
    const fs = await import('fs/promises');
    await fs.writeFile(path.join(__dirname, '../../build/test-stdio-server.js'), serverScript); //Create test server
    const transport = new StdioClientTransport({
        command: "C:\\nvm4w\\nodejs\\node.exe", // USE YOUR EXACT PATH TO node.exe
        args: [path.join(process.cwd(), 'build/test-stdio-server.js')], // Run the simple server script
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
    }
    catch (error) {
        console.error("Error starting transport:", error);
    }
}
testStdio();
//# sourceMappingURL=test-stdio.js.map