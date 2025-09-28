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
                name: toolNameToFormattedMap[item.content.name],
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
        name: toolNameToFormattedMap[item.name],
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
        const actualType = formattedToToolNameMap[item.function.name];
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
