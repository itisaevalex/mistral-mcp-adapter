// src/config.ts
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
export interface Config {
  mistralApiKey: string;
  mistralModel: string;
  mistralApiEndpoint: string;
}

// Load configuration from environment
export function loadConfig(): Config {
  const config: Config = {
    mistralApiKey: process.env.MISTRAL_API_KEY || '',
    mistralModel: process.env.MISTRAL_MODEL || 'ministral-8b-latest',
    mistralApiEndpoint: process.env.MISTRAL_API_ENDPOINT || 'https://api.mistral.ai/v1/chat/completions'
  };

  // Validate required config
  if (!config.mistralApiKey) {
    throw new Error('MISTRAL_API_KEY is required in .env file');
  }

  return config;
}