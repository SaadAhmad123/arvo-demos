import type { InferVersionedArvoContract } from 'arvo-core';
import type { AnyVersionedContract } from '../types';

/**
 * Message content produced when a tool execution finishes.
 *
 * This message type is used by the assistant to provide the outcome
 * of a previously invoked tool call.
 */
export type AgenticToolResultMessageContent = {
  type: 'tool_result';
  /** Identifier linking this result to its originating tool call. */
  tool_use_id: string;
  /** Serialized output returned from the tool execution. */
  content: string;
};

/**
 * Message content for invoking a tool call.
 *
 * This message is used by the assistant to request execution of
 * an external tool with specific input parameters.
 */
export type AgenticToolCallMessageContent = {
  type: 'tool_use';
  /** Unique identifier assigned to this tool call. */
  id: string;
  /** Name of the tool being invoked. */
  name: string;
  /** Input payload passed to the tool for execution. */
  input: object;
};

/**
 * A simple text-based message in the agentic conversation.
 *
 * This message type carries plain assistant or user text
 * without invoking or responding to tool usage.
 */
export type AgenticTextMessageContent = {
  type: 'text';
  /** Raw message text content. */
  content: string;
};

/**
 * Union type for all possible agentic message kinds.
 *
 * Messages exchanged in the conversation may be:
 * - A text message
 * - A tool call request
 * - A tool result response
 */
export type AgenticMessageContent =
  | AgenticTextMessageContent
  | AgenticToolCallMessageContent
  | AgenticToolResultMessageContent;

/**
 * Parameters for making a call to the agentic LLM.
 *
 * @template TTools - A mapping of tool names to their versioned contracts.
 */
export type CallAgenticLLMParam<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to general
  TPrompts extends Record<string, (...args: any[]) => string> = Record<string, (...args: any[]) => string>,
> = {
  type: 'init' | 'tool_results';
  /**
   * Conversation history provided to the LLM.
   * Messages must alternate between `user` and `assistant`.
   */
  messages: {
    /** Role of the sender in the conversation. */
    role: 'user' | 'assistant';
    /** Message content (text, tool call, or tool result). */
    content: AgenticMessageContent[];
  }[];

  /**
   * Tools available to the LLM for invocation.
   * Keys are tool names, values are their contract definitions.
   */
  tools: TTools;

  prompts: TPrompts;
};

/**
 * Output returned from a call to the agentic LLM.
 *
 * @template TTools - A mapping of tool names to their versioned contracts.
 */
export type CallAgenticLLMOutput<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
> = {
  /**
   * Requests for tool execution, if any.
   *
   * Each request is typed according to the `accepts` schema
   * of the corresponding tool contract.
   */
  toolRequests: Array<
    {
      [K in keyof TTools]: {
        type: InferVersionedArvoContract<TTools[K]>['accepts']['type'];
        data: InferVersionedArvoContract<TTools[K]>['accepts']['data'];
        id: string;
      };
    }[keyof TTools]
  > | null;

  /**
   * Freeform assistant response text (if present).
   *
   * This must be null if the LLM produced tool requests.
   */
  response: string | null;

  /**
   * Count of tool request types invoked during this call.
   *
   * Useful for tracking or debugging tool usage.
   */
  toolTypeCount: Record<string, number>;
};

/**
 * A function type representing a call to the agentic LLM.
 *
 * Accepts input parameters and returns the structured LLM output.
 *
 * @template TTools - A mapping of tool names to their versioned contracts.
 */
export type CallAgenticLLM<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  TPrompts extends Record<string, (...args: any[]) => string> = Record<string, (...args: any[]) => string>,
> = (param: CallAgenticLLMParam<TTools, TPrompts>) => Promise<CallAgenticLLMOutput<TTools>>;

/**
 * Parameters for creating an agentic resumable instance.
 *
 * This type defines the configuration required to construct
 * an agent with tool integration and LLM capabilities.
 *
 * @template TName - A string literal type representing the agent's name.
 * @template TServices - The set of services/tools available to the agent.
 */
export type CreateAgenticResumableParams<
  TName extends string,
  TServices extends Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to general
  TPrompts extends Record<string, (...args: any[]) => string>,
> = {
  /** Unique identifier name for the agent instance. */
  name: TName;

  /**
   * Function for calling the agentic LLM,
   * parameterized by the agent's service/tool set.
   */
  agenticLLMCaller: CallAgenticLLM<TServices, TPrompts>;

  /**
   * Set of versioned service contracts available to the agent.
   *
   * Keys are service names; values are contract definitions.
   */
  services: TServices;

  serviceDomains?: Record<{ [K in keyof TServices]: TServices[K]['accepts']['type'] }[keyof TServices], string[]>;

  prompts: TPrompts;
};
