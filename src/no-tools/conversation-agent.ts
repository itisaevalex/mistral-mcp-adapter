// src/conversation-agent.ts
import { MistralClient, Message } from './mistral-client';
import { Config } from './config';

export class ConversationAgent {
  private client: MistralClient;
  private messages: Message[] = [];
  private systemPrompt: string = "You are a helpful assistant.";

  constructor(config: Config) {
    this.client = new MistralClient(config);
    this.resetConversation();
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages[0].content = prompt;
    } else {
      this.resetConversation();
    }
  }

  resetConversation(): void {
    this.messages = [{ role: 'system', content: this.systemPrompt }];
  }

  async invoke(prompt: string): Promise<string> {
    // Add user message
    this.messages.push({ role: 'user', content: prompt });

    try {
      // Call Mistral (no tools)
      const response = await this.client.chat(this.messages);

      // Add assistant response
      this.messages.push({ role: 'assistant', content: response.content });

      return response.content;
    } catch (error) {
      console.error('Error invoking agent:', error);
      throw error; // Re-throw the error for the caller to handle
    }
  }

  getConversationHistory(): Message[] {
    return [...this.messages]; // Return a copy to prevent external modification
  }
}
