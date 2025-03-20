// src/test-conversation-agent.ts
import { loadConfig } from './config';
import { ConversationAgent } from './conversation-agent';
async function testConversationAgent() {
    try {
        const config = loadConfig();
        const agent = new ConversationAgent(config);
        // Test a simple interaction
        const prompt1 = "What is the capital of France?";
        console.log(`User: ${prompt1}`);
        const response1 = await agent.invoke(prompt1);
        console.log(`Agent: ${response1}`);
        // Test a follow-up question
        const prompt2 = "And what is its population?";
        console.log(`User: ${prompt2}`);
        const response2 = await agent.invoke(prompt2);
        console.log(`Agent: ${response2}`);
        // Show conversation history
        console.log("\nConversation History:");
        const history = agent.getConversationHistory();
        history.forEach((message) => {
            console.log(`${message.role}: ${message.content}`);
        });
    }
    catch (error) {
        console.error('Error testing conversation agent:', error);
    }
}
testConversationAgent();
//# sourceMappingURL=test-conversation-agent.js.map