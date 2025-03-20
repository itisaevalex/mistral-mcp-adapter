// src/cli-chat.ts
import { loadConfig } from './config.js';
import { ConversationAgent } from './conversation-agent.js';
import * as readline from 'readline';

async function startInteractiveChat() {
  try {
    const config = loadConfig();
    const agent = new ConversationAgent(config);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('Mistral Chat CLI (Type "exit" or "quit" to end)');

    while (true) {
      const userInput = await new Promise<string>((resolve) => {
        rl.question('You: ', (answer) => {
          resolve(answer);
        });
      });

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        break;
      }

      const response = await agent.invoke(userInput);
      console.log(`Agent: ${response}`);
    }

    rl.close();
    console.log('Chat ended.');

  } catch (error) {
    console.error('Error in interactive chat:', error);
  }
}

startInteractiveChat();