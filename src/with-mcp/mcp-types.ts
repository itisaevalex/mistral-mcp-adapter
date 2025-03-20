// src/with-mcp/mcp-types.ts

// --- Mistral-Specific Tool Definition ---
export interface MistralTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: any; // Use a more specific type if you have a schema
    };
}
// --- MCP Primitives ---

// Prompts (Simplified for this example)
export interface McpPrompt {
  id: string;
  content: string; // The prompt template
}

// Resources (Simplified - you'll likely need a more complex structure)
export interface McpResource {
  id: string;
  type: string; // e.g., "text", "image", "database_record"
  data: any;     // The actual resource data
}

// Tools (MCP representation - maps to MistralTool)
export interface McpTool {
  name: string;
  description: string;
  inputSchema: any; // JSON Schema for input parameters
  // You might add outputSchema here as well
}

// Roots (Simplified)
export interface McpRoot {
  id: string;
  path: string; // e.g., a file path, a database connection string
}

// Sampling (Simplified)
export interface McpSamplingRequest {
  promptId: string;
  parameters: any; // Parameters for the sampling (e.g., temperature)
}

export interface McpSamplingResponse {
  result: string; // The generated text
}

// --- MCP Messages ---

export type McpMessageType =
  | 'request'
  | 'response'
  | 'error'
  | 'ping'
  | 'pong';

export interface McpMessage {
  type: McpMessageType;
  id: string; // Unique message ID
  payload: any; // The actual message payload (depends on the type)
}

// --- MCP Request Payloads ---

export interface McpExecuteToolRequest {
  toolName: string;
  toolParameters: any;
}

// --- MCP Response Payloads ---
export interface McpExecuteToolResponse {
    result: any
}

// --- Error Codes (Example - expand as needed) ---

export enum McpErrorCode {
  OK = 0,
  TOOL_NOT_FOUND = 1,
  INVALID_INPUT = 2,
  TOOL_EXECUTION_ERROR = 3,
  INTERNAL_SERVER_ERROR = 4,
  // ... other error codes ...
}

export interface McpErrorResponse {
  code: McpErrorCode;
  message: string;
}