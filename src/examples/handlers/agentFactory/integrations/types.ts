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
 * Mirrors {@link CallAgenticLLMOutput} but simplifies the `toolRequests`
 * field to a generic array of `{ type, data, id }` items so that consumers
 * do not need access to the service contract types when parsing results.
 *
 * - When `toolRequests` is non-null, `response` must be `null`.
 * - When `toolRequests` is `null`, `response` contains either plain text or
 *   structured JSON (when `outputFormat` was provided).
 *
 * `toolTypeCount` aggregates counts of requested tools by their `type` for
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
 * 1. A set of tool requests (`toolRequests`) when the LLM decides external
 *    actions are required, or
 * 2. A direct `response` (text or structured object) when no tools are needed.
 *
 * Implementations should ensure mutual exclusivity between `toolRequests`
 * and `response` (i.e., one is `null` while the other is populated).
 */
export type LLMIntergration = (param: LLMIntegrationParam) => Promise<LLMIntegrationOutput>;
