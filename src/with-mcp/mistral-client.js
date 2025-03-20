// src/with-mcp/mistral-client.ts
import axios from 'axios';
export class MistralClient {
    constructor(config) {
        this.retryCount = 3;
        this.retryDelay = 1000;
        this.apiKey = config.mistralApiKey;
        this.model = config.mistralModel;
        this.apiEndpoint = config.mistralApiEndpoint;
    }
    async chat(messages, options = {}) {
        let attempt = 0;
        while (attempt < this.retryCount) {
            try {
                const requestBody = {
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens,
                };
                // Conditionally add tools and tool_choice if provided
                if (options.tools && options.tools.length > 0) {
                    requestBody.tools = options.tools;
                    requestBody.tool_choice = options.toolChoice || 'auto'; // Default to 'auto' if tools are present
                }
                const response = await axios.post(this.apiEndpoint, requestBody, // Use the dynamically constructed request body
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                });
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
            }
            catch (error) {
                attempt++;
                if (attempt >= this.retryCount) {
                    if (error instanceof Error) {
                        console.error(`Mistral API request failed: ${error.message}`, error);
                        throw new Error('Failed to call Mistral API: ' + error.message);
                    }
                    throw new Error('Failed to call Mistral API after multiple attempts');
                }
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Failed to call Mistral API after multiple attempts');
    }
}
//# sourceMappingURL=mistral-client.js.map