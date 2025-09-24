import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../../../../config';
import type { AgenticToolResultMessageContent, CallAgenticLLMOutput, CallAgenticLLMParam } from '../types';
import type { AnyVersionedContract } from '../../types';
import { SemanticConventions as OpenInferenceSemanticConventions } from '@arizeai/openinference-semantic-conventions';
import type { ChatModel } from 'openai/resources/shared.mjs';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs';

/**
 * Converts Arvo event type names to OpenAI-compatible tool names.
 */
const toolNameFormatter = (name: string) => name.replaceAll('.', '_');

/**
 * Converts OpenAI tool names back to original Arvo event types.
 */
const reverseToolNameFormatter = (formattedName: string) => formattedName.replaceAll('_', '.');

/**
 * Converts Arvo agentic messages to OpenAI-compatible chat completion messages.
 *
 * This function performs several critical transformations:
 * - Injects system prompts as developer role messages (OpenAI's preferred approach)
 * - Flattens Arvo's nested content arrays into individual messages
 * - Maps agentic message roles and content types to OpenAI's schema
 * - Ensures tool calls are immediately followed by their results (OpenAI requirement)
 * - Handles different content types: text, tool_use, and tool_result
 *
 * The function maintains message order while restructuring the conversation history
 * to meet OpenAI's specific formatting requirements, particularly around tool interactions.
 */
const formatMessagesForOpenAI = (
  messages: CallAgenticLLMParam['messages'],
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
                name: toolNameFormatter(item.content.name),
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
 * OpenAI GPT integration for agentic LLM calls within Arvo Agentic Resumable.
 *
 * This function connects Arvo’s contract-based event system with OpenAI’s GPT models,
 * enabling AI agents to make tool usage decisions and generate responses in
 * Arvo’s event-driven architecture.
 *
 * Key features:
 * - Converts Arvo contracts into OpenAI-compatible tool definitions
 * - Applies tool name formatting for API compatibility
 * - Cleans JSON schemas by removing Arvo-specific metadata fields
 * - Formats agentic messages for OpenAI’s API
 * - Handles both direct text responses and tool invocation requests
 * - Tracks tool usage frequency for workflow management
 *
 * @template TTools - Record of Arvo service contracts available as tools
 *
 * @param param - Configuration object for the LLM call
 * @param param.messages - Conversation history in agentic format
 * @param param.tools - Available Arvo service contracts to expose as tools
 * @param param.system - Optional system prompt for guiding model behavior
 * @param param.span - OpenInference span for tracing and observability
 *
 * @returns Promise resolving to structured LLM output with either
 * a direct text response or tool requests
 *
 * @throws {Error} If OpenAI provides neither a response nor tool requests
 */
export const openaiLLMCaller: <TTools extends Record<string, AnyVersionedContract>>(
  param: Pick<CallAgenticLLMParam<TTools>, 'type' | 'messages' | 'tools' | 'span'> & { system?: string },
) => Promise<CallAgenticLLMOutput<TTools>> = async ({ messages, tools, system, span }) => {
  /**
   * Configure model and invocation parameters.
   */
  const llmModel: ChatModel = 'gpt-4o-mini';
  const llmInvocationParams = {
    temperature: 0.5,
    maxTokens: 1024,
  };

  // Attach OpenInference metadata for observability
  span.setAttributes({
    [OpenInferenceSemanticConventions.LLM_PROVIDER]: 'openai',
    [OpenInferenceSemanticConventions.LLM_SYSTEM]: 'openai',
    [OpenInferenceSemanticConventions.LLM_MODEL_NAME]: llmModel,
    [OpenInferenceSemanticConventions.LLM_INVOCATION_PARAMETERS]: JSON.stringify({
      temperature: llmInvocationParams.temperature,
      max_tokens: llmInvocationParams.maxTokens,
    }),
  });

  /**
   * Convert Arvo contracts to OpenAI tool definitions.
   *
   * - Extracts JSON schema
   * - Removes Arvo-specific fields (toolUseId$$, parentSubject$$)
   * - Preserves descriptions and required fields
   */
  const toolDef: ChatCompletionTool[] = Object.values(tools).map((item) => {
    const inputSchema = item.toJsonSchema().accepts.schema;
    // @ts-ignore - Properties exist but TS may not infer correctly
    const { toolUseId$$, parentSubject$$, ...cleanedProperties } = inputSchema?.properties ?? {};
    // @ts-ignore - Required exists but TS may not infer correctly
    const cleanedRequired = (inputSchema?.required ?? []).filter(
      (item: string) => item !== 'toolUseId$$' && item !== 'parentSubject$$',
    );
    return {
      type: 'function',
      function: {
        name: toolNameFormatter(item.accepts.type),
        description: item.description,
        parameters: {
          ...inputSchema,
          properties: cleanedProperties,
          required: cleanedRequired,
        },
      },
    } as ChatCompletionTool;
  });

  /**
   * Format conversation history for OpenAI.
   */
  const formattedMessages = formatMessagesForOpenAI(messages, system);

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
   * Process and structure tool invocation requests from OpenAI's response.
   *
   * Multiple tool calls may be requested in a single response. Each tool call
   * includes a unique ID, the function name, and the structured arguments.
   * Convert these back to Arvo's event-driven format while tracking usage statistics.
   */
  const toolRequests: NonNullable<CallAgenticLLMOutput<typeof tools>['toolRequests']> = [];
  const toolTypeCount: Record<string, number> = {};

  if (
    message?.choices?.[0]?.finish_reason === 'function_call' ||
    message?.choices?.[0]?.finish_reason === 'tool_calls'
  ) {
    for (const item of message.choices[0]?.message.tool_calls ?? []) {
      if (item.type === 'function') {
        const actualType = reverseToolNameFormatter(item.function.name);
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
   * Extract direct text response if OpenAI provided one.
   */
  let finalResponse: string | null = null;
  if (message?.choices?.[0]?.finish_reason === 'stop') {
    finalResponse = message.choices[0].message.content;
  }

  /**
   * Structure the response according to Arvo’s agentic LLM output format.
   */
  const data: CallAgenticLLMOutput<typeof tools> = {
    toolRequests: toolRequests.length ? toolRequests : null,
    response: finalResponse,
    toolTypeCount,
    usage: {
      tokens: {
        prompt: message.usage?.prompt_tokens ?? 0,
        completion: message.usage?.completion_tokens ?? 0,
      },
    },
  };

  /**
   * Validate that OpenAI provided a usable response.
   *
   * Must always have either a text response or tool requests.
   */
  if (!data.response && !data.toolRequests) {
    throw new Error('Something went wrong. No response or tool request');
  }

  return data;
};
