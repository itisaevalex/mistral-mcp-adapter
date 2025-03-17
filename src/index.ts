// src/index.ts
import { loadConfig } from './config';
import { MistralMcpAdapter } from './mcp-adapter';

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    console.log(`Starting Mistral MCP Adapter with model: ${config.mistralModel}`);
    
    // Create and start adapter
    const adapter = new MistralMcpAdapter(config);
    await adapter.start();
  } catch (error) {
    console.error('Error starting Mistral MCP Adapter:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}