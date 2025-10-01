import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const LLMIntegrations: DemoCodePanel = {
  singlePanel: true,
  heading: 'Building the LLM Integrations',
  description: cleanString(`
    Now that you've explored the Agentic Resumable, let's implement the intelligence
    layer of the agents—the large language model integrations. The factory pattern can 
    leverage any integration, as long as it follows the correct interface, 
    providing flexibility in choosing your intelligence layer.

    ## Integration Examples
    
    Two of the most popular integrations are demonstrated here: 
      - OpenAI's ChatGPT model
      - Anthropic's Claude model 
      
    You can directly copy these integrations into your codebase and supply the correct API keys to 
    the respective LLM SDKs to get started with the intelligence layer. These implementations 
    follow the \`LLMIntegration\` function interface, making them completely interchangeable.

    ## How Integrations Work?
    
    Inside each integration, the messages and tool definitions,provided at runtime by the 
    Agentic Resumable, are formatted correctly for the LLM SDK. The LLM API is then called, 
    and it outputs either a response or requests for tool calls. These outputs are 
    formatted back to the expected structure and returned to the Agentic Resumable 
    for processing and event emission.
    
    The integration functions execute only at specific points in the lifecycle:
    
    - When a new event marking the initiation of the agentic process arrives
    - When all the tool call for a give interaction cycle have been collected
    
    This well-defined execution boundary enables make strong assumptions about
    system state when implementing integrations.
  `),
  tabs: [
    {
      title: 'agentFactory/integrations/anthropic.ts',
      lang: 'ts',
      code: `
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../../../../config';
import { SemanticConventions as OpenInferenceSemanticConventions } from '@arizeai/openinference-semantic-conventions';
import type { LLMIntegrationOutput, LLMIntergration } from './types';
import type { AgenticToolDefinition } from '../types';

/**
 * Anthropic Claude integration for agentic LLM calls within Arvo orchestrators.
 *
 * Bridges Arvo's contract-based event system with Anthropic's Claude API, enabling
 * AI agents to make intelligent tool decisions and generate responses within Arvo's
 * event-driven architecture. Handles message formatting, tool name conversion, and
 * response parsing for seamless integration.
 *
 * ## Tool Name Conversion
 * Arvo event types use dot notation (e.g., 'user.lookup') but Anthropic requires
 * underscore format (e.g., 'user_lookup'). This function handles the conversion
 * automatically while preserving the original semantics.
 *
 * @returns Promise resolving to structured LLM response with either text response or tool requests
 *
 * @throws {Error} When Claude provides neither a response nor tool requests
 */
export const anthropicLLMCaller: LLMIntergration = async ({
  messages,
  outputFormat,
  toolDefinitions,
  systemPrompt,
  span,
}) => {
  const llmModel: Anthropic.Messages.Model = 'claude-sonnet-4-0';
  const llmInvocationParams = {
    temperature: 0.5,
    maxTokens: 1024,
  };

  // Configure OpenTelemetry attributes for observability
  span.setAttributes({
    [OpenInferenceSemanticConventions.LLM_PROVIDER]: 'anthropic',
    [OpenInferenceSemanticConventions.LLM_SYSTEM]: 'anthropic',
    [OpenInferenceSemanticConventions.LLM_MODEL_NAME]: llmModel,
    [OpenInferenceSemanticConventions.LLM_INVOCATION_PARAMETERS]: JSON.stringify({
      temperature: llmInvocationParams.temperature,
      max_tokens: llmInvocationParams.maxTokens,
    }),
  });

  // Convert tool names to Anthropic-compatible format
  const toolDef: AgenticToolDefinition[] = [];
  const toolNameToFormattedMap: Record<string, string> = {};
  const formattedToToolNameMap: Record<string, string> = {};
  for (const item of toolDefinitions) {
    const formatted = item.name.replaceAll('.', '_');
    toolNameToFormattedMap[item.name] = formatted;
    formattedToToolNameMap[formatted] = item.name;
    // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can never be undefined
    toolDef.push({ ...item, name: toolNameToFormattedMap[item.name]! });
  }

  /**
   * Converts agentic message format to Anthropic's expected structure.
   * Maps content types and ensures tool names are properly formatted.
   */
  const formattedMessages = messages.map((item) => ({
    ...item,
    content: item.content.map((c) => {
      if (c.type === 'text') {
        return {
          type: c.type,
          text: c.content,
        };
      }
      if (c.type === 'tool_use') {
        return {
          ...c,
          name: toolNameToFormattedMap[c.name],
        };
      }
      return c;
    }),
  }));

  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const message = await anthropic.messages.create({
    model: llmModel,
    max_tokens: llmInvocationParams.maxTokens,
    temperature: llmInvocationParams.temperature,
    system: systemPrompt ?? undefined,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    tools: toolDef as any,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    messages: formattedMessages as any,
  });

  /**
   * Extracts and processes tool requests from Claude's response.
   * Converts tool names back to Arvo format and tracks usage counts.
   */
  const toolRequests: NonNullable<LLMIntegrationOutput['toolRequests']> = [];
  const toolTypeCount: Record<string, number> = {};

  if (message.stop_reason === 'tool_use') {
    for (const item of message.content) {
      if (item.type === 'tool_use') {
        // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can never be undefined
        const actualType = formattedToToolNameMap[item.name]!; // The system understands the original tool name no the AI tool name
        toolRequests.push({
          type: actualType,
          id: item.id,
          data: item.input as unknown as object,
        });
        // Track tool usage for workflow management
        if (!toolTypeCount[actualType]) {
          toolTypeCount[actualType] = 0;
        }
        toolTypeCount[actualType] = toolTypeCount[actualType] + 1;
      }
    }
  }

  /**
   * Extracts direct text response when Claude doesn't request tools.
   * Handles structured output parsing if an output format is specified.
   */
  let finalResponse: string | null = null;
  if (message.stop_reason === 'end_turn') {
    finalResponse = message.content[0]?.type === 'text' ? message.content[0].text : 'No final response';
  }

  // Structure response according to Arvo's agentic LLM output format
  const data: LLMIntegrationOutput = {
    toolRequests: toolRequests.length ? toolRequests : null,
    response: finalResponse ? (outputFormat ? outputFormat.parse(JSON.parse(finalResponse)) : finalResponse) : null,
    toolTypeCount,
    usage: {
      tokens: {
        prompt: message.usage.input_tokens,
        completion: message.usage.output_tokens,
      },
    },
  };

  // Validate that Claude provided a usable response
  if (!data.response && !data.toolRequests) {
    throw new Error('Something went wrong. No response or tool request');
  }

  return data;
};


      `,
    },
    {
      title: 'agentFactory/integrations/openai.ts',
      lang: 'ts',
      code: `
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../../../config';
import type { AgenticToolResultMessageContent, CallAgenticLLMParam } from '../types';
import { SemanticConventions as OpenInferenceSemanticConventions } from '@arizeai/openinference-semantic-conventions';
import type { ChatModel } from 'openai/resources/shared.mjs';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs';
import type { LLMIntegrationOutput, LLMIntergration } from './types';

/**
 * Converts Arvo agentic messages to OpenAI-compatible chat completion format.
 *
 * Performs critical transformations required by OpenAI's API:
 * - Injects system prompts as developer role messages (OpenAI's preferred approach)
 * - Flattens Arvo's nested content arrays into individual messages
 * - Ensures tool calls are immediately followed by their results (strict OpenAI requirement)
 * - Maps agentic message types to OpenAI's schema while preserving conversation flow
 *
 * @param messages - Conversation history in agentic message format
 * @param systemPrompt - Optional system prompt to inject as developer message
 * @returns Array of OpenAI-compatible chat completion messages
 */
const formatMessagesForOpenAI = (
  messages: CallAgenticLLMParam['messages'],
  toolNameToFormattedMap: Record<string, string>,
  systemPrompt?: string,
): ChatCompletionMessageParam[] => {
  const formatedMessages: ChatCompletionMessageParam[] = [];

  // Inject system prompt as developer role (OpenAI's recommended approach)
  if (systemPrompt) {
    formatedMessages.push({
      role: 'developer',
      content: systemPrompt,
    });
  }

  const flattendMessages: {
    role: (typeof messages)[number]['role'];
    content: (typeof messages)[number]['content'][number];
  }[] = [];

  // OpenAI requires tool results to immediately follow their corresponding tool calls.
  // We build a map to efficiently pair tool calls with their results.
  const toolResponseMap: Record<string, AgenticToolResultMessageContent> = {};

  // Flatten nested content structure and build tool response mapping
  for (const rawMessage of messages) {
    for (const rawContent of rawMessage.content) {
      flattendMessages.push({
        role: rawMessage.role,
        content: rawContent,
      });
      if (rawContent.type === 'tool_result') {
        toolResponseMap[rawContent.tool_use_id] = rawContent;
      }
    }
  }

  // Convert to OpenAI format while maintaining proper message sequencing
  for (const item of flattendMessages) {
    // A user can only have text content or tool results
    if (item.role === 'user') {
      if (item.content.type === 'text') {
        formatedMessages.push({
          role: 'user',
          content: item.content.content,
        });
      }
    }
    // Handle assistant messages (text responses and tool calls)
    if (item.role === 'assistant') {
      if (item.content.type === 'text') {
        formatedMessages.push({
          role: 'assistant',
          content: item.content.content,
        });
      }
      if (item.content.type === 'tool_use') {
        formatedMessages.push({
          role: 'assistant',
          tool_calls: [
            {
              type: 'function',
              id: item.content.id,
              function: {
                // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can not be undefined
                name: toolNameToFormattedMap[item.content.name]!,
                arguments: JSON.stringify(item.content.input),
              },
            },
          ],
        });
        // Immediately add the corresponding tool result (OpenAI requirement)
        formatedMessages.push({
          role: 'tool',
          tool_call_id: item.content.id,
          content: JSON.stringify(toolResponseMap[item.content.id] ?? { error: 'No tool response' }),
        });
      }
    }
  }

  return formatedMessages;
};

/**
 * OpenAI ChatGPT integration for agentic LLM calls within Arvo orchestrators.
 *
 * Bridges Arvo's contract-based event system with OpenAI's GPT models, enabling
 * AI agents to make intelligent tool decisions and generate responses within Arvo's
 * event-driven architecture. Handles the complex message formatting and tool
 * conversion required for OpenAI's API while maintaining Arvo's type safety.
 *
 * ## OpenAI-Specific Handling
 * - Tool calls must be immediately followed by their results in message history
 * - Function names cannot contain dots, requiring automatic name conversion
 * - System prompts are injected as developer role messages for better adherence
 *
 * @returns Promise resolving to structured LLM output with either
 * a direct text response or tool requests
 *
 * @throws {Error} If OpenAI provides neither a response nor tool requests
 */
export const openaiLLMCaller: LLMIntergration = async ({
  messages,
  toolDefinitions,
  systemPrompt,
  span,
  outputFormat,
}) => {
  /**
   * Configure model and invocation parameters.
   */
  const llmModel: ChatModel = 'gpt-4o-mini';
  const llmInvocationParams = {
    temperature: 0.5,
    maxTokens: 1024,
  };

  // Configure OpenTelemetry attributes for observability
  span.setAttributes({
    [OpenInferenceSemanticConventions.LLM_PROVIDER]: 'openai',
    [OpenInferenceSemanticConventions.LLM_SYSTEM]: 'openai',
    [OpenInferenceSemanticConventions.LLM_MODEL_NAME]: llmModel,
    [OpenInferenceSemanticConventions.LLM_INVOCATION_PARAMETERS]: JSON.stringify({
      temperature: llmInvocationParams.temperature,
      max_tokens: llmInvocationParams.maxTokens,
    }),
  });

  // Convert tool definitions to OpenAI function format
  const toolDef: ChatCompletionTool[] = [];
  const toolNameToFormattedMap: Record<string, string> = {};
  const formattedToToolNameMap: Record<string, string> = {};
  for (const item of toolDefinitions) {
    const formatted = item.name.replaceAll('.', '_');
    toolNameToFormattedMap[item.name] = formatted;
    formattedToToolNameMap[formatted] = item.name;
    toolDef.push({
      type: 'function',
      function: {
        // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can not be undefined
        name: toolNameToFormattedMap[item.name]!,
        description: item.description,
        parameters: item.input_schema,
      },
    } as ChatCompletionTool);
  }

  // Format conversation history for OpenAI's specific requirements
  const formattedMessages = formatMessagesForOpenAI(messages, toolNameToFormattedMap, systemPrompt ?? undefined);

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const message = await openai.chat.completions.create({
    model: llmModel,
    max_tokens: llmInvocationParams.maxTokens,
    temperature: llmInvocationParams.temperature,
    tools: toolDef,
    messages: formattedMessages,
  });

  /**
   * Extracts and processes tool requests from OpenAI's response.
   * Converts function calls back to Arvo event format and tracks usage.
   */
  const toolRequests: NonNullable<LLMIntegrationOutput['toolRequests']> = [];
  const toolTypeCount: Record<string, number> = {};

  if (
    message?.choices?.[0]?.finish_reason === 'function_call' ||
    message?.choices?.[0]?.finish_reason === 'tool_calls'
  ) {
    for (const item of message.choices[0]?.message.tool_calls ?? []) {
      if (item.type === 'function') {
        // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can not be undefined
        const actualType = formattedToToolNameMap[item.function.name]!;
        toolRequests.push({
          type: actualType,
          id: item.id,
          data: JSON.parse(item.function.arguments),
        });
        // Track tool usage
        toolTypeCount[actualType] = (toolTypeCount[actualType] ?? 0) + 1;
      }
    }
  }

  /**
   * Extracts direct text response when OpenAI doesn't request tools.
   * Handles structured output parsing if an output format is specified.
   */
  let finalResponse: string | null = null;
  if (message?.choices?.[0]?.finish_reason === 'stop') {
    finalResponse = message.choices[0].message.content;
  }

  // Structure response according to Arvo's agentic LLM output format
  const data: LLMIntegrationOutput = {
    toolRequests: toolRequests.length ? toolRequests : null,
    response: finalResponse ? (outputFormat ? outputFormat.parse(JSON.parse(finalResponse)) : finalResponse) : null,
    toolTypeCount,
    usage: {
      tokens: {
        prompt: message.usage?.prompt_tokens ?? 0,
        completion: message.usage?.completion_tokens ?? 0,
      },
    },
  };

  // Validate that OpenAI provided a usable response
  if (!data.response && !data.toolRequests) {
    throw new Error('Something went wrong. No response or tool request');
  }

  return data;
};


      
      `,
    },
    {
      title: 'agentFactory/types.ts',
      lang: 'ts',
      code: `
import type { z } from 'zod';
import type { AnyVersionedContract, CallAgenticLLMOutput, CallAgenticLLMParam } from '../types';

/**
 * Parameters for an LLM integration that plugs into the agentic orchestrator.
 */
export type LLMIntegrationParam = Omit<
  CallAgenticLLMParam<Record<string, AnyVersionedContract>, z.AnyZodObject>,
  'services'
>;

/**
 * Normalized result produced by an LLM integration call.
 *
 * Mirrors {@link CallAgenticLLMOutput} but simplifies the \`toolRequests\`
 * field to a generic array of \`{ type, data, id }\` items so that consumers
 * do not need access to the service contract types when parsing results.
 *
 * - When \`toolRequests\` is non-null, \`response\` must be \`null\`.
 * - When \`toolRequests\` is \`null\`, \`response\` contains either plain text or
 *   structured JSON (when \`outputFormat\` was provided).
 *
 * \`toolTypeCount\` aggregates counts of requested tools by their \`type\` for
 * quick diagnostics and analytics.
 */
export type LLMIntegrationOutput = Omit<CallAgenticLLMOutput, 'toolRequests'> & {
  toolRequests: Array<{
    type: string;
    data: object;
    id: string;
  }> | null;
};

/**
 * Function signature every LLM integration must implement.
 *
 * Given conversation context, available tool definitions, and optional
 * structured-output constraints, the integration must return either:
 *
 * 1. A set of tool requests (\`toolRequests\`) when the LLM decides external
 *    actions are required, or
 * 2. A direct \`response\` (text or structured object) when no tools are needed.
 *
 * Implementations should ensure mutual exclusivity between \`toolRequests\`
 * and \`response\` (i.e., one is \`null\` while the other is populated).
 */
export type LLMIntergration = (param: LLMIntegrationParam) => Promise<LLMIntegrationOutput>;


      
      `,
    },
  ],
};
