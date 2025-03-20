// src/index.ts
import { loadConfig } from './config';
import { MistralMcpAdapter } from './mcp-adapter';

// Very early logging
console.error("🔍 Process starting...");
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught exception:', err);
});

async function main() {
  console.error("📌 main() function called");
  try {
    // Load configuration
    console.error("⚙️ Loading configuration...");
    const config = loadConfig();
    console.error(`📋 Configuration loaded, model: ${config.mistralModel}`);
    
    // Create and start adapter
    console.error("🏗️ Creating adapter instance...");
    const adapter = new MistralMcpAdapter(config);
    console.error("▶️ Starting adapter...");
    await adapter.start();
  } catch (error) {
    console.error('❌ Error starting Mistral MCP Adapter:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  console.error("🚀 Script executed directly, calling main()");
  main();
}