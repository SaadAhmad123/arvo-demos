import { createMcpAgent } from './agentFactory/createMcpAgent';
import { anthropicLLMCaller } from './agentFactory/integrations/anthropic';

export const testMcpAnthropicAgent = createMcpAgent({
  name: 'test.anthropic',
  mcpSseServer: {
    url: 'https://docs.mcp.cloudflare.com/sse',
  },
  systemPrompt: () => 'You are a helpful agent',
  agenticLLMCaller: anthropicLLMCaller,
});
