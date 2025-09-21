import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../../../config';
import type { CallAgenticLLMOutput, CallAgenticLLMParam } from './types';
import type { AnyVersionedContract } from '../types';
const toolNameFormatter = (name: string) => name.replaceAll('.', '_');
const reverseToolNameFormatter = (formattedName: string) => formattedName.replaceAll('_', '.');

export const anthropicLLMCaller: <TTools extends Record<string, AnyVersionedContract>>(
  param: Pick<CallAgenticLLMParam<TTools>, 'type' | 'messages' | 'tools'> & { system?: string },
) => Promise<CallAgenticLLMOutput<TTools>> = async ({ messages, tools, system }) => {
  // The Anthropic LLM API does not like '.'; so need to format it properly
  const toolDef = Object.values(tools).map((item) => {
    const inputSchema = item.toJsonSchema().accepts.schema;
    // @ts-ignore
    const { toolUseId$$, parentSubject$$, ...cleanedProperties } = inputSchema?.properties ?? {};
    // @ts-ignore
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

  // Formatting messages for Anthropic AI
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
    model: 'claude-sonnet-4-0',
    max_tokens: 1024,
    system: system,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    tools: toolDef as any,
    // biome-ignore lint/suspicious/noExplicitAny: Any is fine here for now
    messages: formattedMessages as any,
  });

  const toolRequests: NonNullable<CallAgenticLLMOutput<typeof tools>['toolRequests']> = [];
  const toolTypeCount: Record<string, number> = {};

  if (message.stop_reason === 'tool_use') {
    for (const item of message.content) {
      if (item.type === 'tool_use') {
        const actualType = reverseToolNameFormatter(item.name); // The system understands the original tool name no the AI tool name
        toolRequests.push({
          // @ts-ignore
          type: actualType,
          id: item.id,
          // @ts-ignore
          data: item.input as unknown as object,
        });
        if (!toolTypeCount[actualType]) {
          toolTypeCount[actualType] = 0;
        }
        toolTypeCount[actualType] = toolTypeCount[actualType] + 1;
      }
    }
  }

  let finalResponse: string | null = null;
  if (message.stop_reason === 'end_turn') {
    finalResponse = message.content[0]?.type === 'text' ? message.content[0].text : 'No final response';
  }

  const data: CallAgenticLLMOutput<typeof tools> = {
    toolRequests: toolRequests.length ? toolRequests : null,
    response: finalResponse,
    toolTypeCount,
  };

  if (!data.response && !data.toolRequests) {
    throw new Error('Something went wrong. No response or tool request');
  }

  return data;
};
