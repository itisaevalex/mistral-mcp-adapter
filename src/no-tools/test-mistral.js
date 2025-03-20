// src/test-mistral.ts
import { loadConfig } from './config';
import { MistralClient } from './mistral-client';
async function testMistralAPI() {
    try {
        const config = loadConfig();
        const client = new MistralClient(config);
        const messages = [
            { role: 'user', content: 'Hello, what is the capital of France?' },
        ];
        console.log('Sending request to Mistral API...');
        const response = await client.chat(messages);
        console.log('Response from Mistral:');
        console.log(response.content);
    }
    catch (error) {
        console.error('Error testing Mistral API:', error);
    }
}
testMistralAPI();
//# sourceMappingURL=test-mistral.js.map