// src/config.ts
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Load configuration from environment
export function loadConfig() {
    var _a;
    const config = {
        mistralApiKey: process.env.MISTRAL_API_KEY || '',
        mistralModel: process.env.MISTRAL_MODEL || 'ministral-8b-latest', //  more common default
        mistralApiEndpoint: process.env.MISTRAL_API_ENDPOINT || 'https://api.mistral.ai/v1/chat/completions',
        mcpServerCommand: process.env.MCP_SERVER_COMMAND, // No default, as it's optional
        mcpServerArgs: ((_a = process.env.MCP_SERVER_ARGS) === null || _a === void 0 ? void 0 : _a.split(' ')) || undefined, // Handle undefined
        logLevel: process.env.LOG_LEVEL || 'info',
    };
    // Validate required config
    if (!config.mistralApiKey) {
        throw new Error('MISTRAL_API_KEY is required in .env file');
    }
    return config;
}
//# sourceMappingURL=config.js.map