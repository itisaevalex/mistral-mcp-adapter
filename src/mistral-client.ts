// src/mistral-client.ts
import axios from 'axios';
import { Config } from './config';

// Message interface
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Basic Mistral client
export class MistralClient {
  private apiKey: string;
  private model: string;
  private apiEndpoint: string;

  constructor(config: Config) {
    this.apiKey = config.mistralApiKey;
    this.model = config.mistralModel;
    this.apiEndpoint = config.mistralApiEndpoint;
  }

  /**
   * Send a chat completion request to Mistral API
   */
  async chat(messages: Message[], options: {
    temperature?: number;
    maxTokens?: number;
  } = {}) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: this.model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Mistral API Error:', (error as any).response?.data || error.message);
        throw new Error(`Failed to call Mistral API: ${error.message}`);
      }
      throw new Error('Failed to call Mistral API: Unknown error');
    }
  }
}