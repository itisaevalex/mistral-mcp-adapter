import { spawn } from 'child_process';
import * as path from 'path';
import * as readline from 'readline';

// Path to your compiled adapter
const adapterPath = path.resolve(__dirname, './dist/index.js'); 
// Note: Adjust the path if you put this in a subdirectory

// Add this near the imports at the top of the file
interface McpResponse {
  jsonrpc: string;
  id: string;
  result?: {
    content: Array<{
      type: string;
      text?: string;
    }>;
  };
  error?: {
    message: string;
  };
}

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

// After the line that creates the adapter, add this:
adapter.stdout.setEncoding('utf8');

// Process response
let responseData = '';
adapter.stdout.on('data', (data) => {
  console.error(`Received raw data: ${data.toString().length} bytes`);
  responseData += data.toString();
  
  console.error(`Current buffer: ${responseData.length} bytes`);
  
  // Try to find a complete JSON object in the buffer
  try {
    // Split the buffer by newlines to handle multiple JSON objects
    const lines = responseData.split('\n');
    for (let line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line) as McpResponse;
          console.error('\n📥 Successfully parsed response');
          console.log('\n📥 Mistral says:');
          
          // Display the response text
          if (response.result && response.result.content) {
            response.result.content.forEach((item) => {
              if (item.type === 'text') {
                console.log(item.text);
              }
            });
          } else if (response.error) {
            console.log(`Error: ${response.error.message}`);
          }
        } catch (e) {
          console.error('Error parsing line:', e);
        }
      }
    }
    // Clear the buffer after processing
    responseData = '';
  } catch (e) {
    console.error('Error parsing response:', e);
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