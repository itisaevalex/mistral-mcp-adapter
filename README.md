# Universal Mistral MCP Adapter

A TypeScript adapter that enables Mistral AI models to use tools provided by any Model Context Protocol (MCP) servers. This project allows you to connect your Mistral applications to multiple external tools and data sources through the standardized MCP protocol using a simple configuration file.

## Overview

This adapter acts as a bridge between Mistral AI models and multiple MCP servers, allowing the models to use tools provided by these servers. The adapter:

1. Connects to multiple MCP servers defined in a configuration file
2. Discovers available tools from all connected servers
3. Dynamically registers these tools with Mistral models
4. Routes tool calls to the appropriate server
5. Handles tool execution when the model requests it
6. Provides fallbacks for critical functionality when servers are unavailable

## Features

- 🔌 Connect to any MCP server through a simple configuration file
- 🧰 Use tools from multiple MCP servers simultaneously with Mistral AI models
- 🔄 Dynamic tool discovery and registration
- 💬 Interactive conversation support with tool usage
- 📝 Conversation history management
- ⚙️ Modular and extensible architecture
- 🛡️ Robust error handling and fallback strategies
- 🔍 Comprehensive logging for debugging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Mistral API key
- One or more MCP servers to connect to

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/universal-mistral-mcp-adapter.git
cd universal-mistral-mcp-adapter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Mistral API key:
```
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large
```

4. Create a `mcp-config.json` file in the project root to configure your MCP servers:
```json
{
  "servers": {
    "weather": {
      "type": "stdio",
      "name": "WeatherServer",
      "command": "node",
      "args": ["build/with-mcp/tools/weather-server.js"],
      "description": "Weather information service"
    },
    "math": {
      "type": "stdio",
      "name": "MathServer",
      "command": "node",
      "args": ["build/with-universal-mcp/tools/math-server.js"],
      "description": "Mathematical calculation service"
    }
  },
  "defaultServer": "weather"
}
```

5. Build the project:
```bash
npm run build
```

## Quick Start

### Interactive Chatbot

The easiest way to use the adapter is through the interactive chatbot:

```bash
npm run chat
```

This will start an interactive CLI session where you can chat with Mistral and use all the MCP tools.

Example usage:
```
You: What's the weather like in Tokyo?
Chatbot: The weather in Tokyo is currently 72°F with sunny skies and a light breeze.

You: Can you calculate 145 * 32?
Chatbot: The result of 145 * 32 is 4640.
```

### Command Line Options

The chatbot supports several options:

```bash
npm run chat -- --config ./my-custom-config.json --debug
```

Available options:
- `--config <path>`: Path to a custom MCP configuration file
- `--debug` or `-d`: Enable debug logging
- `--no-history`: Disable saving conversation history
- `--help` or `-h`: Show help message

## Programmatic Usage

You can also use the adapter programmatically in your own applications:

```typescript
import { McpChatbot } from './build/with-universal-mcp/chatbot.js';

async function main() {
  // Create a chatbot instance
  const chatbot = new McpChatbot({
    mcpConfigPath: './my-config.json',
    debug: true,
    saveHistory: true
  });

  // Initialize and connect to MCP servers
  await chatbot.initialize();

  // Send messages and get responses
  const response1 = await chatbot.sendMessage("What's the weather like in Tokyo?");
  console.log(response1);

  const response2 = await chatbot.sendMessage("Calculate 145 * 32");
  console.log(response2);

  // Clean up
  await chatbot.disconnect();
}

main().catch(console.error);
```

## Adding New MCP Servers

To add new MCP servers, simply update your `mcp-config.json` file:

```json
{
  "servers": {
    "weather": { ... },
    "math": { ... },
    "database": {
      "type": "stdio",
      "name": "DatabaseServer",
      "command": "node",
      "args": ["path/to/database-server.js"],
      "description": "Database query service"
    }
  }
}
```

## Documentation

For more detailed information about the adapter architecture, implementation details, and advanced usage, see the [MCP Adapter Guide](docs/mcp-adapter-guide.md).

For information on how to use the chatbot, see the [MCP Chatbot Guide](docs/mcp-chatbot-guide.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/anthropics/model-context-protocol) by Anthropic
- [Mistral AI](https://mistral.ai/) for their powerful language models