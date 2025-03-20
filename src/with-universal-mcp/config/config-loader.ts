// src/with-universal-mcp/config/config-loader.ts
import * as fs from 'fs';
import * as path from 'path';
import { McpConfig, defaultMcpConfig } from './mcp-config.js';

/**
 * Loads MCP configuration from a file or returns default configuration
 */
export function loadMcpConfig(configPath?: string): McpConfig {
  if (!configPath) {
    return defaultMcpConfig;
  }

  try {
    const fullPath = path.resolve(configPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Configuration file not found at ${fullPath}, using defaults`);
      return defaultMcpConfig;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const config = JSON.parse(fileContent) as McpConfig;
    
    // Validate config
    if (!config.servers || Object.keys(config.servers).length === 0) {
      console.warn('No valid servers found in config, using defaults');
      return defaultMcpConfig;
    }
    
    // Set default server if not specified
    if (!config.defaultServer) {
      config.defaultServer = Object.keys(config.servers)[0];
    }
    
    return config;
  } catch (error) {
    console.error('Error loading MCP config:', error);
    return defaultMcpConfig;
  }
}