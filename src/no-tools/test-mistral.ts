// src/test-mistral.ts
import { loadConfig } from './config.js';
import { Message, MistralClient } from './mistral-client.js';

async function testMistralAPI() {
  try {
    const config = loadConfig();
    const client = new MistralClient(config);

    const messages: Message[] = [
      { role: 'user', content: 'Hello, what is the capital of France?' },
    ];

    console.log('Sending request to Mistral API...');
    const response = await client.chat(messages);

    console.log('Response from Mistral:');
    console.log(response.content);

  } catch (error) {
    console.error('Error testing Mistral API:', error);
  }
}

testMistralAPI();