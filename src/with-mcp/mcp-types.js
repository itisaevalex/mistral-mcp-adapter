// src/with-mcp/mcp-types.ts
// --- Error Codes (Example - expand as needed) ---
export var McpErrorCode;
(function (McpErrorCode) {
    McpErrorCode[McpErrorCode["OK"] = 0] = "OK";
    McpErrorCode[McpErrorCode["TOOL_NOT_FOUND"] = 1] = "TOOL_NOT_FOUND";
    McpErrorCode[McpErrorCode["INVALID_INPUT"] = 2] = "INVALID_INPUT";
    McpErrorCode[McpErrorCode["TOOL_EXECUTION_ERROR"] = 3] = "TOOL_EXECUTION_ERROR";
    McpErrorCode[McpErrorCode["INTERNAL_SERVER_ERROR"] = 4] = "INTERNAL_SERVER_ERROR";
    // ... other error codes ...
})(McpErrorCode || (McpErrorCode = {}));
//# sourceMappingURL=mcp-types.js.map