# Mistral MCP Client

A TypeScript client that enables Mistral AI models to use tools provided by Model Context Protocol (MCP) servers. This project allows you to connect your Mistral applications to external tools and data sources through the standardized MCP protocol.

## Overview

This client acts as a bridge between Mistral AI models and MCP servers, allowing the models to use tools provided by these servers. The client:

1. Connects to an MCP server
2. Discovers available tools
3. Presents these tools to Mistral models
4. Handles tool execution when the model requests it

## Features

- 🔌 Connect to any MCP server
- 🧰 Use tools from MCP servers with Mistral AI models
- 💬 Interactive conversation support with tool usage
- 🔄 Conversation history management
- 🛠️ Extensible tool manager

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mistral API key
- An MCP server to connect to (such as `mcp-server-sqlite`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mistral-mcp-client.git
cd mistral-mcp-client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Mistral API key:
```
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large
MCP_SERVER_COMMAND=path/to/your/mcp-server
MCP_SERVER_ARGS=--arg1 value1 --arg2 value2
```

4. Build the project:
```bash
npm run build
```

## Usage

### Running the Client

Start the client:

```bash
npm start
```

This will:
1. Connect to the specified MCP server
2. Register available tools
3. Start an interactive prompt where you can chat with Mistral

### Interactive Conversation

Once the client is running, you can interact with it through the command line:

```
Enter your prompt: What is the current weather in New York?
```

If the MCP server provides weather tools, Mistral will use them to answer your question.

## Architecture

The project consists of several key components:

- **MCP Client**: Connects to MCP servers and interfaces with their tools
- **Conversation Agent**: Manages the conversation with Mistral and handles tool execution
- **Tool Manager**: Registers and manages tools from MCP servers
- **Mistral Client**: Interfaces with the Mistral API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/anthropics/model-context-protocol) by Anthropic
- [Mistral AI](https://mistral.ai/) for their powerful language models