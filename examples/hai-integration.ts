import { AgentService, AnthropicModels, LoggerService } from '@hai/agent-core';
import { DeveloperAgent, cliBasedAgentEventHandler } from '@hai/agent-pool';
import { fileToolsList, getToolsFromMcpServers } from '@hai/agent-tools';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    // Define MCP server configuration
    const mcpServerConfig = {
      mcpServers: {
        'aws-s3': {
          command: 'node',
          args: [path.resolve(__dirname, '../dist/index.js')],
          env: {
            // AWS credentials can be set here or via AWS config files
            AWS_REGION: 'us-east-1',
          },
          // Auto-approve these tools to avoid confirmation prompts
          autoApprove: ['list_buckets', 'list_objects', 'get_bucket_policy']
        }
      }
    };

    // Get MCP tools from the configuration
    const mcpTools = await getToolsFromMcpServers(JSON.stringify(mcpServerConfig));
    
    // Create a developer agent with the MCP tools
    const agent = new DeveloperAgent({
      model: AnthropicModels.CLAUDE_3_7_SONNET,
      temperature: 0.7,
      tools: [...mcpTools, ...fileToolsList],
      customInstructions: 'You are a helpful assistant that can interact with AWS S3.',
      agentEventHandler: cliBasedAgentEventHandler,
      conversationHistoryPath: './conversation-history.json'
    });
    
    // Execute the agent with a task
    const result = await agent.execute({
      humanPrompt: 'List all S3 buckets and show me the first 5 objects in each bucket.'
    });
    
    console.log('Agent execution completed:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();