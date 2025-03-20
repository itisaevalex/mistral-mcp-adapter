// src/mistral-client.ts
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
        var _a;
        let attempt = 0;
        while (attempt < this.retryCount) {
            try {
                const response = await axios.post(this.apiEndpoint, {
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 1024,
                    // Removed tools and tool_choice
                }, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                const assistantMessage = response.data.choices[0].message;
                //Removed toolCalls
                return {
                    content: assistantMessage.content || '',
                    model: response.data.model,
                    usage: response.data.usage,
                    // Removed toolCalls
                };
            }
            catch (error) {
                attempt++;
                if (attempt >= this.retryCount) {
                    if (error instanceof Error) {
                        console.error('Mistral API Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                        throw new Error(`Failed to call Mistral API: ${error.message}`);
                    }
                    throw new Error(`Failed to call Mistral API. Unknown Error: ${error}`);
                }
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Failed to call Mistral API after multiple attempts'); // Should never get here
    }
}
//# sourceMappingURL=mistral-client.js.map