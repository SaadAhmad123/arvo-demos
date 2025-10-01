import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const CreatingAgents: DemoCodePanel = {
  singlePanel: true,
  heading: 'Creating Arvo-compatible Event Driven AI Agents',
  description: cleanString(`

    Once integrations and factories are complete, you can build agentic systems. This 
    example demonstrates two MCP Agents: \`astroDocsMcpAgent\` and \`findDomainMcpAgent\`, 
    which orchestrate their respective MCP services via the MCP client integration. The 
    \`webInfoAgent\`, an Agentic Resumable, registers these MCP Agents and orchestrates 
    them. The MCP Agents are also directly callable via their respective events. Additionally, 
    the \`calculatorAgent\` Agentic Resumable registers calculator and Fibonacci service-generated
    event handlers.

    **This example demonstrates that in Arvo, event handlers based on Arvo primitives can interconnect
    regardless of their internal operational logic.**

    ## Event Flow Architecture

    The execution flow when an agent invokes a service follows this pattern:

    \`LLM Agent → Emit Event → Event Broker → Target Event Handler (potentially another Agent) → Process (may emit additional events) → Emit Response Event → Return to Original Agent\`

    This event-driven approach eliminates direct dependencies between agents and services, 
    achieving loose coupling while maintaining type safety and contract adherence through 
    compile-time validation. The architecture enables AI systems to integrate naturally with 
    existing enterprise event-driven architectures, treating AI agents as first-class event 
    handlers without requiring specialized infrastructure or communication patterns.
  `),
  tabs: [
    {
      title: 'handlers/agent.calculator.ts',
      lang: 'ts',
      code: `
import z from 'zod';
import { createAgenticResumable } from '../agentFactory/createAgenticResumable.js';
import { openaiLLMCaller } from '../agentFactory/integrations/openai.js';
import type { CallAgenticLLM } from '../agentFactory/types.js';
import { calculatorContract } from './calculator.handler.js';
import { fibonacciContract } from './fibonacci.handler.js';

/**
 * Calculator agent implementation that processes natural language input
 * and executes mathematical operations when feasible.
 *
 * This handler demonstrates the Agentic Resumable pattern's capability
 * to interface with arbitrary Arvo Event Handlers and orchestrate their
 * operations through a unified agentic interface.
 */
export const calculatorAgent = createAgenticResumable({
  name: 'calculator',
  description: 'This Agent can perform calculations based on the tools available to it.',
  services: {
    calculatorHandler: calculatorContract.version('1.0.0'),
    fibonnaciHandler: fibonacciContract.version('1.0.0'),
  },
  maxToolInteractions: 100,
  outputFormat: z.object({
    response: z
      .string()
      .describe(
        'The final answer of the query. It must be a string. You can stringify the number. If no response is available then the response is NaN (Not a number)',
      ),
    details: z.string().describe('The detailed answer to the query'),
  }),
  systemPrompt: () =>
    'If, based on the available tools you cannot perform the calculation then just tell me tha you cannot perform it and give me a terse reasoning',
  agenticLLMCaller: openaiLLMCaller as CallAgenticLLM,
});
  

      `,
    },
    {
      title: 'handlers/agent.mcp.astro.docs.ts',
      lang: 'ts',
      code: `
import { createMcpAgent } from '../agentFactory/createMcpAgent.js';
import { MCPClient } from '../agentFactory/integrations/MCPClient.js';
import { openaiLLMCaller } from '../agentFactory/integrations/openai.js';

/**
 * MCP agent implementation that establishes connectivity with an MCP
 * server functioning as a knowledge base for the agent.
 *
 * The agent processes input event messages, formulates an optimal
 * execution plan, and invokes the connected MCP tools to generate
 * appropriate responses.
 *
 * This implementation demonstrates how the MCP Agent Arvo Event Handler
 * can integrate with arbitrary MCP servers through the MCP Client interface.
 */
export const astroDocsMcpAgent = createMcpAgent({
  name: 'astro.docs',
  description: 'This agent enables you to find and search correct information from Astro docs',
  mcpClient: new MCPClient('https://mcp.docs.astro.build/mcp'),
  agenticLLMCaller: openaiLLMCaller,
});



    `,
    },
    {
      title: 'handlers/agent.mcp.findadomain.ts',
      lang: 'ts',
      code: `
import z from 'zod';
import { createMcpAgent } from '../agentFactory/createMcpAgent.js';
import { anthropicLLMCaller } from '../agentFactory/integrations/anthropic.js';
import { MCPClient } from '../agentFactory/integrations/MCPClient.js';

/**
 * Domain information agent that interfaces with the Find A Domain
 * remote MCP server to retrieve domain-related data.
 *
 * This implementation demonstrates the agent's capability to return
 * responses in any structured format specified in its configuration,
 * providing flexibility in output schema definition.
 */
export const findDomainMcpAgent = createMcpAgent({
  name: 'findadomina',
  description:
    'An agent which can help find a domain. Ask it what it can do to figure out it capabilitie which you can then use.',
  outputFormat: z.object({
    response: z.string().describe('The short response to the query'),
    details: z.string().describe('The detailed response of the query'),
  }),
  mcpClient: new MCPClient('https://api.findadomain.dev/mcp'),
  agenticLLMCaller: anthropicLLMCaller,
});

      `,
    },
    {
      title: 'handlers/agent.webinfo.ts',
      lang: 'ts',
      code: `
import { createAgenticResumable } from '../agentFactory/createAgenticResumable.js';
import { anthropicLLMCaller } from '../agentFactory/integrations/anthropic.js';
import type { CallAgenticLLM } from '../agentFactory/types.js';
import { astroDocsMcpAgent } from './agent.mcp.astro.docs.js';
import { findDomainMcpAgent } from './agent.mcp.findadomain.js';

/**
 * Web Information Agent implementation that demonstrates inter-agent
 * communication patterns within the system.
 *
 * This Agentic Resumable demonstrates the utilization of a unified configuration approach for
 * connecting with other agents, maintaining consistent integration patterns
 * whether interfacing with ArvoOrchestrators, ArvoResumables, ArvoEventHandlers or Arvo Agents.
 */
export const webInfoAgent = createAgenticResumable({
  name: 'web.info',
  description: 'This agent can answer queries related to domain search/finding and astro docs',
  systemPrompt: () =>
    'Make a plan and then execute it. Take into account the available tool while planning and executing',
  services: {
    astroDocAgent: astroDocsMcpAgent.contract.version('1.0.0'),
    findDomainAgent: findDomainMcpAgent.contract.version('1.0.0'),
  },
  agenticLLMCaller: anthropicLLMCaller as CallAgenticLLM,
});



      `,
    },
    {
      title: 'handlers/calculate.handler.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

/**
 * Calculator event handler for mathematical operations that are
 * computationally intensive or difficult for agents to execute directly.
 *
 * This handler accepts JavaScript mathematical expressions and evaluates
 * them within a strictly sandboxed environment. Within the Arvo event-driven
 * architecture, this handler can be invoked by users, ArvoOrchestrators,
 * ArvoResumables, and Agentic ArvoResumables through the event broker.
 *
 * The toolUseId$$ passthrough field enables participation in agentic workflows
 * by providing the correlation identifier required by LLMs to track tool call
 * execution across the request-response cycle.
 */
export const calculatorContract = createArvoContract({
  uri: '#/demo/calculator/execute',
  type: 'com.calculator.execute',
  description: 'Executes mathematical expressions safely using a restricted evaluation environment.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        expression: z
          .string()
          .describe(
            'Mathematical expression to evaluate. Supports: arithmetic operators (+, -, *, /, %, **), ' +
              'Math functions (sqrt, pow, sin, cos, tan, log, exp, abs, round, min, max, floor, ceil), ' +
              'and constants (PI, E). Examples: "2 + 2", "sqrt(16) * 5", "PI * pow(2, 3)", "sin(PI/2)"',
          ),
        // This is a usefull field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
      emits: {
        'evt.calculator.execute.success': z.object({
          result: z.number().describe('Computed result of the mathematical expression as a finite number.'),
          expression: z.string().describe('Original expression that was evaluated, returned for verification.'),
          // This is a usefull field when working with AI Agents for tool call correlation
          toolUseId$$: z.string().optional(),
        }),
      },
    },
  },
});

export const calculatorHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: calculatorContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        const { expression, toolUseId$$ } = event.data;

        if (!expression || expression.trim().length === 0) {
          throw new Error('Expression cannot be empty');
        }

        try {
          const result = evaluateMathExpression(expression);

          if (typeof result !== 'number' || !Number.isFinite(result)) {
            throw new Error('Expression must evaluate to a finite number');
          }

          return {
            type: 'evt.calculator.execute.success',
            data: {
              result,
              expression,
              toolUseId$$,
            },
            executionunits: expression.length * 1e-6,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(\`Failed to evaluate expression: \${message}\`);
        }
      },
    },
  });

function evaluateMathExpression(expr: string): number {
  const whitelist = /^[0-9+\-*/().%\s,]+$/;

  const safeExpr = expr
    .replace(/\bPI\b/g, 'PI')
    .replace(/\bE\b/g, 'E')
    .replace(/\bsqrt\b/g, 'sqrt')
    .replace(/\bpow\b/g, 'pow')
    .replace(/\babs\b/g, 'abs')
    .replace(/\bsin\b/g, 'sin')
    .replace(/\bcos\b/g, 'cos')
    .replace(/\btan\b/g, 'tan')
    .replace(/\basin\b/g, 'asin')
    .replace(/\bacos\b/g, 'acos')
    .replace(/\batan\b/g, 'atan')
    .replace(/\blog\b/g, 'log')
    .replace(/\bexp\b/g, 'exp')
    .replace(/\bfloor\b/g, 'floor')
    .replace(/\bceil\b/g, 'ceil')
    .replace(/\bround\b/g, 'round')
    .replace(/\bmin\b/g, 'min')
    .replace(/\bmax\b/g, 'max');

  const testExpr = safeExpr.replace(
    /\b(sqrt|pow|abs|sin|cos|tan|asin|acos|atan|log|exp|floor|ceil|round|min|max|PI|E)\b/g,
    '',
  );

  if (!whitelist.test(testExpr)) {
    throw new Error('Expression contains invalid characters or functions');
  }

  const evalFunc = new Function(
    'sqrt',
    'pow',
    'abs',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'log',
    'exp',
    'floor',
    'ceil',
    'round',
    'min',
    'max',
    'PI',
    'E',
    \`"use strict"; return (\${safeExpr});\`,
  );

  return evalFunc(
    Math.sqrt,
    Math.pow,
    Math.abs,
    Math.sin,
    Math.cos,
    Math.tan,
    Math.asin,
    Math.acos,
    Math.atan,
    Math.log,
    Math.exp,
    Math.floor,
    Math.ceil,
    Math.round,
    Math.min,
    Math.max,
    Math.PI,
    Math.E,
  );
}


      
      `,
    },
    {
      title: 'handlers/fibonacci.handler.ts',
      lang: 'ts',
      code: `
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { createSimpleArvoContract } from 'arvo-core';
import z from 'zod';

/**
 * Fibonacci sequence generator event handler for computationally intensive
 * operations that are impractical for agents to execute directly.
 *
 * This handler generates Fibonacci series using an iterative algorithm and
 * integrates with the Arvo event-driven architecture, enabling invocation
 * by users, ArvoOrchestrators, ArvoResumables, and Agentic ArvoResumables
 * through the event broker.
 *
 * The toolUseId$$ passthrough field enables participation in agentic workflows
 * by providing the correlation identifier required by LLMs to track tool call
 * execution across the request-response cycle.
 */
export const fibonacciContract = createSimpleArvoContract({
  uri: '#/demo/handler/fibonnaci',
  type: 'fibonacci.series',
  description: 'Generates a fibonacci sequence up to the specified length using an iterative algorithm',
  versions: {
    '1.0.0': {
      accepts: z.object({
        limit: z.number().min(0).max(1000).describe('The maximum length of the fibonacci series to generate'),
        // This is a usefull field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
      emits: z.object({
        series: z.number().array().describe('The generated fibonacci sequence as an array of numbers'),
        // This is a usefull field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
    },
  },
});

export const fibonacciHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: fibonacciContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        const limit = event.data.limit;

        if (limit <= 0) {
          throw new Error('Limit must be greater than 0');
        }

        const series: number[] = [];

        if (limit >= 1) {
          series.push(0);
        }

        if (limit >= 2) {
          series.push(1);
        }

        for (let i = 2; i < limit; i++) {
          // biome-ignore lint/style/noNonNullAssertion: Sure that these cannot be empty
          const nextNumber = series[i - 1]! + series[i - 2]!;
          series.push(nextNumber);
        }

        return {
          type: 'evt.fibonacci.series.success',
          data: {
            series: series,
            toolUseId$$: event.data.toolUseId$$,
          },
          executionunits: limit * 1e-6,
        };
      },
    },
  }); 
      
      `,
    },
  ],
};
