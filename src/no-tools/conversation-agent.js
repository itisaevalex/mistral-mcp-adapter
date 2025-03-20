// src/conversation-agent.ts
import { MistralClient } from './mistral-client';
export class ConversationAgent {
    constructor(config) {
        this.messages = [];
        this.systemPrompt = "You are a helpful assistant.";
        this.client = new MistralClient(config);
        this.resetConversation();
    }
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
        if (this.messages.length > 0 && this.messages[0].role === 'system') {
            this.messages[0].content = prompt;
        }
        else {
            this.resetConversation();
        }
    }
    resetConversation() {
        this.messages = [{ role: 'system', content: this.systemPrompt }];
    }
    async invoke(prompt) {
        // Add user message
        this.messages.push({ role: 'user', content: prompt });
        try {
            // Call Mistral (no tools)
            const response = await this.client.chat(this.messages);
            // Add assistant response
            this.messages.push({ role: 'assistant', content: response.content });
            return response.content;
        }
        catch (error) {
            console.error('Error invoking agent:', error);
            throw error; // Re-throw the error for the caller to handle
        }
    }
    getConversationHistory() {
        return [...this.messages]; // Return a copy to prevent external modification
    }
}
//# sourceMappingURL=conversation-agent.js.map