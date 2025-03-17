import { spawn } from 'child_process';
import * as path from 'path';
import * as readline from 'readline';

// Path to your compiled adapter
const adapterPath = path.resolve(__dirname, './dist/index.js'); 
// Note: Adjust the path if you put this in a subdirectory

// Start the adapter as a child process
const adapter = spawn('node', [adapterPath], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to send a message to Mistral
function sendMessage(prompt: string) {
  // Create MCP request
  const request = {
    jsonrpc: '2.0',
    id: `test-${Date.now()}`,
    method: 'call_tool',
    params: {
      name: 'chat',
      arguments: {
        prompt: prompt,
        conversation_id: 'test-session',
        temperature: 0.7
      }
    }
  };

  console.log('\n📤 Sending to Mistral MCP...');
  
  // Send request to adapter
  adapter.stdin.write(JSON.stringify(request) + '\n');
}

// Process response
let responseData = '';
adapter.stdout.on('data', (data) => {
  responseData += data.toString();
  
  try {
    // Try to parse as JSON to see if we have a complete response
    const response = JSON.parse(responseData);
    console.log('\n📥 Mistral says:');
    
    // Display the response text
    if (response.result && response.result.content) {
      response.result.content.forEach((item: any) => {
        if (item.type === 'text') {
          console.log(item.text);
        }
      });
    } else if (response.error) {
      console.log(`Error: ${response.error.message}`);
    }
    
    // Reset for next response
    responseData = '';
    
    // Prompt for next message
    rl.question('\n💬 Your message (or "exit" to quit): ', (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        adapter.stdin.end();
        return;
      }
      
      sendMessage(input);
    });
  } catch (e) {
    // Not complete JSON yet, continue collecting data
  }
});

// Handle process exit
adapter.on('close', (code) => {
  console.log(`\nAdapter process exited with code ${code}`);
  process.exit(0);
});

// Handle errors
adapter.on('error', (err) => {
  console.error('Error in adapter process:', err);
  process.exit(1);
});

// Start the conversation
console.log('🤖 Mistral MCP Test Client');
console.log('============================');
rl.question('💬 Your message (or "exit" to quit): ', (input) => {
  if (input.toLowerCase() === 'exit') {
    rl.close();
    adapter.stdin.end();
    return;
  }
  
  sendMessage(input);
});