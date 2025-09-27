import { z } from 'zod';
import type { CreateAgenticResumableParams } from '../types';
import { createSimpleArvoContract } from 'arvo-core';
import { AgenticMessageContentSchema } from '../schemas';

/**
 * Default output format for agents that don't specify a custom output schema.
 * Provides a simple string response format for basic conversational agents.
 */
const DEFAULT_AGENT_OUTPUT_FORMAT = z.object({ response: z.string() });

export const createMcpAgent = <TName extends string, TOutput extends z.AnyZodObject>({
  name,
  outputFormat,
  enableMessageHistoryInResponse,
}: Omit<CreateAgenticResumableParams<TName, never, TOutput>, 'services'> & {
  mcpSseServerUrl: string;
}) => {
  const contract = createSimpleArvoContract({
    uri: `#/demo/handler/agent/mcp/${name.replaceAll('.', '/')}`,
    type: `agent.mcp.${name}` as `agent.mcp.${TName}`,
    versions: {
      '1.0.0': {
        accepts: z.object({
          message: z.string(),
          toolUseId$$: z.string().optional(),
        }),
        emits: z.object({
          ...(enableMessageHistoryInResponse
            ? {
                messages: z
                  .object({
                    role: z.enum(['user', 'assistant']),
                    content: AgenticMessageContentSchema.array(),
                  })
                  .array(),
              }
            : {}),
          output: (outputFormat ?? DEFAULT_AGENT_OUTPUT_FORMAT) as TOutput,
          toolUseId$$: z.string().optional(),
        }),
      },
    },
    metadata: {
      contractSpecificType: 'MCPAgent',
    },
  });

  return { contract };
};
