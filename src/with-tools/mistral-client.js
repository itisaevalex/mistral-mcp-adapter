// src/with-tools/mistral-client.ts
import axios from 'axios';
// ... (rest of your MistralClient code remains the same) ...
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
                const response = await axios.post(this.apiEndpoint, {
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens,
                    tools: options.tools,
                    tool_choice: options.toolChoice
                }, {
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