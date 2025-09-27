import { z } from 'zod';

/**
 * Schema for tool result message content.
 *
 * Represents the response data from a completed tool execution that gets
 * sent back to the LLM. This allows the LLM to process tool outputs and
 * continue the conversation flow.
 */
export const AgenticToolResultMessageContentSchema = z.object({
  type: z.literal('tool_result'),
  /** Unique identifier linking this result back to the original tool request */
  tool_use_id: z.string(),
  /** JSON-serialized output data returned by the executed tool */
  content: z.string(),
});

/**
 * Schema for tool call message content.
 *
 * Represents a request from the LLM to execute a specific tool or service.
 * Contains all necessary information for the orchestrator to invoke the
 * appropriate Arvo service contract.
 */
export const AgenticToolCallMessageContentSchema = z.object({
  type: z.literal('tool_use'),
  /** Unique identifier for tracking this specific tool request */
  id: z.string(),
  /** Name/type of the tool to execute (maps to Arvo service contract types) */
  name: z.string(),
  /** Parameters to pass to the tool, structured according to the tool's contract */
  input: z.object({}).passthrough(), // Allows any object structure
});

/**
 * Schema for text message content.
 *
 * Represents standard conversational text content without any tool interactions.
 * Used for both user messages and direct LLM text responses that don't require
 * tool execution.
 */
export const AgenticTextMessageContentSchema = z.object({
  type: z.literal('text'),
  /** The actual text content of the message */
  content: z.string(),
});

/**
 * Union schema for all possible message content types in agentic conversations.
 *
 * Uses discriminated union on the 'type' field to enable type-safe handling
 * of different message content formats throughout the conversation flow.
 * Supports text messages, tool calls, and tool results.
 */
export const AgenticMessageContentSchema = z.discriminatedUnion('type', [
  AgenticToolResultMessageContentSchema,
  AgenticToolCallMessageContentSchema,
  AgenticTextMessageContentSchema,
]);
