// src/with-tools/test-tool-agent.ts
import { loadConfig } from './config.js';
import { ToolAgent } from './tool-agent.js';
import { ToolManager } from './tool-manager.js';

async function testToolAgent() {
  try {
    const config = loadConfig();
    const toolManager = new ToolManager();

    // Example: A simple calculator tool
    toolManager.registerTool({
      name: 'calculate',
      description: 'Performs a simple calculation.',
      parameters: {
        expression: { type: 'string', description: 'The mathematical expression to evaluate.' },
      },
      required: ['expression'],
      execute: async (args: { expression: string }) => {
        try {
          // WARNING: Using eval() is generally unsafe.  Use a proper expression parser in production.
          const result = eval(args.expression);
          return { result }; // Consistent return type, even for single values
        } catch (error) {
          return { error: 'Invalid expression' }; // Consistent return type on error
        }
      },
    });

      toolManager.registerTool({
          name: 'get_current_time',
          description: 'Returns the current time.',
          parameters: {},
          required: [],
          execute: async () => {
              const now = new Date();
              return { time: now.toLocaleTimeString() };
          },
      });

    const agent = new ToolAgent(config, toolManager);

    // Test with a calculation
    const prompt1 = "What is 2 + 2?";
    console.log(`User: ${prompt1}`);
    const response1 = await agent.invoke(prompt1);
    console.log(`Agent: ${response1}`);

    // Test with a different calculation
    const prompt2 = "Calculate 15 * 7";
    console.log(`User: ${prompt2}`);
    const response2 = await agent.invoke(prompt2);
    console.log(`Agent: ${response2}`);

      //Test a non calculation
      const prompt3 = "What time is it?";
      console.log(`User: ${prompt3}`);
      const response3 = await agent.invoke(prompt3);
      console.log(`Agent: ${response3}`);

  } catch (error) {
    console.error('Error testing tool agent:', error);
  }
}

testToolAgent();