# Mistral MCP Adapter

A Model Context Protocol (MCP) adapter for Mistral AI models, enabling seamless integration between Mistral's powerful language models and applications that support the MCP standard, such as Claude Desktop.

## Overview

This adapter allows you to use Mistral AI models within Claude Desktop or any other MCP-compatible application. It translates between the Model Context Protocol and Mistral's API, maintaining conversation context and providing a smooth experience.

## Features

- 🔄 Protocol translation between MCP and Mistral AI API
- 💬 Conversation history management
- 🎛️ Temperature and parameter control
- 🧠 Compatible with multiple Mistral models
- 🔌 Easy integration with Claude Desktop

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mistral API key
- Claude Desktop (for full integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mistral-mcp-adapter.git
cd mistral-mcp-adapter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Mistral API key:
```
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-medium
```

4. Build the project:
```bash
npm run build
```

## Usage

### Running the Adapter

Start the adapter:

```bash
npm start
```

### Configuration with Claude Desktop

1. Edit your Claude Desktop configuration file (typically at `~/.claude-desktop/config.json`):

```json
{
  "mcpServers": {
    "mistral-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mistral-mcp-adapter/dist/index.js"]
    }
  }
}
```

2. Restart Claude Desktop to load the new configuration.

3. Use the adapter in Claude by typing:

```
@mistral-mcp.chat What is the capital of France?
```

You can also specify conversation context:

```
@mistral-mcp.chat And what's its population?
conversation_id=france-chat
```

### Testing with the Test Client

A test client is included for direct testing:

```bash
npx ts-node test-client.ts
```

This provides an interactive way to test the adapter without Claude Desktop.

## Project Structure

```
mistral-mcp-adapter/
├── src/
│   ├── config.ts            # Configuration management
│   ├── mistral-client.ts    # Mistral API client
│   ├── mcp-adapter.ts       # MCP server implementation
│   └── index.ts             # Entry point
├── test-client.ts           # Interactive test client
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables (not committed)
```

## Development

### Available Scripts

- `npm run build` - Build the TypeScript code
- `npm start` - Start the adapter
- `npm run dev` - Start with auto-reloading for development

### Adding New Tools

The current implementation includes a basic chat tool. To add more tools, modify the `ListToolsRequestSchema` handler in `mcp-adapter.ts`.

## Future Enhancements

Planned improvements for this project:
- Support for streaming responses
- Model selection tool
- Code generation specialized tool
- Web interface for testing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/anthropics/model-context-protocol) by Anthropic
- [Mistral AI](https://mistral.ai/) for their powerful language models