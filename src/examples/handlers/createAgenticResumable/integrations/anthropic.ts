import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../../../../config';
import type { CallAgenticLLMOutput, CallAgenticLLMParam } from '../types';
import type { AnyVersionedContract } from '../../types';
import { SemanticConventions as OpenInferenceSemanticConventions } from '@arizeai/openinference-semantic-conventions';
/**
 * Converts Arvo event type names to Anthropic-compatible tool names.
 */
const toolNameFormatter = (name: string) => name.replaceAll('.', '_');

/**
 * Converts Anthropic tool names back to original Arvo event types.
 */
const reverseToolNameFormatter = (formattedName: string) => formattedName.replaceAll('_', '.');

/**
 * Anthropic Claude integration for agentic LLM calls within Arvo Agentic Resumable.
 *
 * This function bridges Arvo's contract-based event system with Anthropic's Claude API,
 * enabling AI agents to make decisions about tool usage and generate responses within
 * Arvo's event-driven architecture.
 *
 * Key features:
 * - Automatically converts Arvo contracts to Anthropic tool definitions
 * - Handles tool name formatting for API compatibility
 * - Filters out Arvo-specific metadata fields from tool schemas
 * - Processes both direct responses and tool requests from Claude
 * - Maintains conversation context and message formatting
 *
 * @template TTools - Record of Arvo service contracts available as tools
 *
 * @param param - Configuration object for the LLM call
 * @param param.messages - Conversation history in agentic message format
 * @param param.tools - Available Arvo service contracts to expose as tools
 * @param param.system - Optional system prompt to guide Claude's behavior
 *
 * @returns Promise resolving to structured LLM response with either text response or tool requests
 *
 * @throws {Error} When Claude provides neither a response nor tool requests
 */
export const anthropicLLMCaller: <TTools extends Record<string, AnyVersionedContract>>(
  param: Pick<CallAgenticLLMParam<TTools>, 'type' | 'messages' | 'tools' | 'span'> & { system?: string },
) => Promise<CallAgenticLLMOutput<TTools>> = async ({ messages, tools, system, span }) => {
  const llmModel: Anthropic.Messages.Model = 'claude-sonnet-4-0';
  const llmInvocationParams = {
    temperature: 0.5,
    maxTokens: 1024,
  };

  // Setting up took OpenInference Attributes
  span.setAttributes({
    [OpenInferenceSemanticConventions.LLM_PROVIDER]: 'anthropic',
    [OpenInferenceSemanticConventions.LLM_SYSTEM]: 'anthropic',
    [OpenInferenceSemanticConventions.LLM_MODEL_NAME]: llmModel,
    [OpenInferenceSemanticConventions.LLM_INVOCATION_PARAMETERS]: JSON.stringify({
      temperature: llmInvocationParams.temperature,
      max_tokens: llmInvocationParams.maxTokens,
    }),
  });

  /**
   * Convert Arvo contracts to Anthropic tool definitions.
   *
   * Extracts JSON schema from each contract and formats it for Anthropic's API:
   * - Removes Arvo-specific fields (toolUseId$$, parentSubject$$)
   * - Converts tool names to underscore format
   * - Preserves contract descriptions and validation schemas
   */
  const toolDef = Object.values(tools).map((item) => {
    const inputSchema = item.toJsonSchema().accepts.schema;
    // @ts-ignore - The 'properties' field exists in there but is not pick up by typescript compiler
    const { toolUseId$$, parentSubject$$, ...cleanedProperties } = inputSchema?.properties ?? {};
    // @ts-ignore - The 'required' field exists in there but is not pick up by typescript compiler
    const cleanedRequired = (inputSchema?.required ?? []).filter(
      (item: string) => item !== 'toolUseId$$' && item !== 'parentSubject$$',
    );
    return {
      name: toolNameFormatter(item.accepts.type),
      description: item.description,
      input_schema: {
        ...inputSchema,
        properties: cleanedProperties,
        required: cleanedRequired,
      },
    };
  });

  /**
   * Format conversation messages for Anthropic's API.
   *
   * Converts agentic message format to Anthropic's expected structure:
   * - Maps text content to Anthropic's text format
   * - Converts tool_use messages with proper name formatting
   * - Preserves tool_result messages as-is for context
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
          name: toolNameFormatter(c.name),
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
    system: system,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    tools: toolDef as any,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    messages: formattedMessages as any,
  });

  /**
   * Parse tool requests from Claude's response.
   *
   * When Claude decides to use tools, extract the requests and convert
   * them back to Arvo event format with proper typing.
   */
  const toolRequests: NonNullable<CallAgenticLLMOutput<typeof tools>['toolRequests']> = [];
  const toolTypeCount: Record<string, number> = {};

  if (message.stop_reason === 'tool_use') {
    for (const item of message.content) {
      if (item.type === 'tool_use') {
        const actualType = reverseToolNameFormatter(item.name); // The system understands the original tool name no the AI tool name
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
   * Extract direct text response if Claude provided one.
   *
   * When Claude doesn't need tools, it provides a direct text response
   * that can be returned to the user immediately.
   */
  let finalResponse: string | null = null;
  if (message.stop_reason === 'end_turn') {
    finalResponse = message.content[0]?.type === 'text' ? message.content[0].text : 'No final response';
  }

  /**
   * Structure the response according to Arvo's agentic LLM output format.
   *
   * Remember - Final response is prefered over tool requests
   */
  const data: CallAgenticLLMOutput<typeof tools> = {
    toolRequests: toolRequests.length ? toolRequests : null,
    response: finalResponse,
    toolTypeCount,
    usage: {
      tokens: {
        prompt: message.usage.input_tokens,
        completion: message.usage.output_tokens,
      },
    },
  };

  /**
   * Validate that Claude provided a usable response.
   *
   * Claude should always provide either a direct response or tool requests.
   * If neither is present, something went wrong with the API call.
   */
  if (!data.response && !data.toolRequests) {
    throw new Error('Something went wrong. No response or tool request');
  }

  return data;
};
