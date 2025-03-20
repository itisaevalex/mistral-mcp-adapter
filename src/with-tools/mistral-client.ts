// src/with-tools/mistral-client.ts
import axios from 'axios';
import { Config } from './config';

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    tool_call_id?: string; // For tool *results*
    tool_calls?: ToolCall[]; // For Mistral's tool *requests*  <-- ADD THIS
}

export interface MistralTool {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: any;
    };
}

export interface ToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    tools?: MistralTool[];
    toolChoice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
}

// ... (rest of your MistralClient code remains the same) ...
export class MistralClient {
    private apiKey: string;
    private model: string;
    private apiEndpoint: string;
    private retryCount: number = 3;
    private retryDelay: number = 1000;

    constructor(config: Config) {
        this.apiKey = config.mistralApiKey;
        this.model = config.mistralModel;
        this.apiEndpoint = config.mistralApiEndpoint;
    }

    async chat(messages: Message[], options: ChatOptions = {}): Promise<{
        content: string;
        model: string;
        usage: any;
        toolCalls?: ToolCall[];
    }> {
        let attempt = 0;
        while (attempt < this.retryCount) {
            try {
                const response = await axios.post(
                    this.apiEndpoint,
                    {
                        model: this.model,
                        messages: messages,
                        temperature: options.temperature || 0.7,
                        max_tokens: options.maxTokens,
                        tools: options.tools,
                        tool_choice: options.toolChoice
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    }
                );

                const data = response.data;
                if (!data || !data.choices || data.choices.length === 0) {
                    throw new Error('Invalid response from Mistral API: No choices returned.');
                }

                const message = data.choices[0].message;

                return {
                    content: message.content || '',
                    model: data.model,
                    usage: data.usage,
                    toolCalls: message.tool_calls
                };

            } catch (error: unknown) {
                attempt++;
                if (attempt >= this.retryCount) {
                   if(error instanceof Error){
                    console.error(`Mistral API request failed: ${error.message}`, error);
                       throw new Error ('Failed to call Mistral API: ' + error.message)
                   }
                }
              const delay = this.retryDelay * Math.pow(2, attempt -1);
              console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Failed to call Mistral API after multiple attempts');
    }
}