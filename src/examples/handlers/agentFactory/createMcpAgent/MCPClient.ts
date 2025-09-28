import type { AgenticToolDefinition } from '../types';
import { ArvoOpenTelemetry, exceptionToSpan, logToSpan, type OpenTelemetryHeaders } from 'arvo-core';
import type { Tool, ListToolsResult } from '@modelcontextprotocol/sdk/types.d.ts';
import { Client } from '@modelcontextprotocol/sdk/client';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * MCP ([Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)) SSE client for integrating external tool capabilities with Arvo agents.
 *
 * This client enables AI agents to connect to MCP servers over Server-Sent Events (SSE) transport,
 * discover available tools, and invoke them as part of agentic workflows. The integration provides
 * seamless access to external services while maintaining Arvo's observability and error handling
 * patterns through OpenTelemetry tracing.
 */
export class McpClient {
  /** MCP server endpoint URL */
  public readonly serverUrl: string;

  private client: Client | null;
  private isConnected: boolean;
  private availableTools: Tool[];
  private parentOtelHeaders: OpenTelemetryHeaders | null;

  /**
   * Creates a new instance of McpSseClient.
   *
   * @param serverUrl - Full URL of the target MCP server
   */
  constructor(serverUrl: string, parentOtelHeaders?: OpenTelemetryHeaders) {
    this.serverUrl = serverUrl;
    this.availableTools = [];
    this.client = null;
    this.isConnected = false;
    this.parentOtelHeaders = parentOtelHeaders ?? null;
  }

  /**
   * Establishes an SSE connection to the MCP server and retrieves available tools.
   *
   * @returns A promise that resolves to `true` if the connection was successful,
   * or `false` if the connection attempt failed.
   *
   * @remarks
   * - Logs connection state and available tools to the active OpenTelemetry span.
   * - Errors are captured and reported to telemetry via {@link exceptionToSpan}.
   */
  async connect(): Promise<boolean> {
    return await ArvoOpenTelemetry.getInstance().startActiveSpan({
      name: `McpSseClient.connect<${this.serverUrl}>`,
      disableSpanManagement: true,
      context: this.parentOtelHeaders
        ? {
            inheritFrom: 'TRACE_HEADERS',
            traceHeaders: this.parentOtelHeaders,
          }
        : undefined,
      fn: async (span) => {
        try {
          const transport = this.serverUrl.includes('/mcp')
            ? new StreamableHTTPClientTransport(new URL(this.serverUrl))
            : new SSEClientTransport(new URL(this.serverUrl));
          this.client = new Client(
            {
              name: 'arvo-mcp-client',
              version: '1.0.0',
            },
            {
              capabilities: {
                tools: {},
              },
            },
          );
          await this.client.connect(transport);
          logToSpan(
            {
              level: 'INFO',
              message: 'Connected to MCP Server',
            },
            span,
          );
          const tools: ListToolsResult = await this.client.listTools();
          this.availableTools = tools.tools;
          this.isConnected = true;
          logToSpan(
            {
              level: 'INFO',
              message: 'Available MCP tools:',
              tools: JSON.stringify(
                this.availableTools.map((t: Tool) => ({ name: t.name, description: t.description })),
              ),
            },
            span,
          );
          span.end();
          return this.isConnected;
        } catch (error) {
          exceptionToSpan(error as Error, span);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error)?.message,
          });
          this.isConnected = false;
          return this.isConnected;
        } finally {
          span.end();
        }
      },
    });
  }

  /**
   * Converts the list of available MCP tools into standardized
   * {@link AgenticToolDefinition} objects for LLM consumption.
   *
   * @returns An array of tool definitions or an empty array if not connected.
   */
  get toolDefinitions(): AgenticToolDefinition[] {
    const toolDef: AgenticToolDefinition[] = [];
    if (!this.isConnected) return toolDef;

    for (const item of this.availableTools) {
      toolDef.push({
        name: item.name,
        description: item.description ?? '',
        input_schema: item.inputSchema,
      });
    }

    return toolDef;
  }

  /**
   * Retrieves the raw list of available MCP tools.
   *
   * @returns Array of tools exposed by the connected MCP server.
   */
  get tools(): Tool[] {
    return this.availableTools;
  }

  /**
   * Returns the current connection status.
   *
   * @returns `'connected'` if the client is connected, otherwise `'disconnected'`.
   */
  get status(): 'connected' | 'disconnected' {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  /**
   * Closes the SSE connection to the MCP server and clears internal state.
   *
   * @returns A promise that resolves when the client has been disconnected.
   */
  async disconnect(): Promise<void> {
    return await ArvoOpenTelemetry.getInstance().startActiveSpan({
      name: `McpSseClient.disconnect<${this.serverUrl}>`,
      disableSpanManagement: true,
      context: this.parentOtelHeaders
        ? {
            inheritFrom: 'TRACE_HEADERS',
            traceHeaders: this.parentOtelHeaders,
          }
        : undefined,
      fn: async (span) => {
        if (this.client && this.isConnected) {
          await this.client.close();
          this.isConnected = false;
          this.client = null;
          logToSpan(
            {
              level: 'INFO',
              message: 'Disconnected from MCP server',
            },
            span,
          );
        } else {
          logToSpan(
            {
              level: 'INFO',
              message: 'MCP server already disconnected',
            },
            span,
          );
        }
      },
    });
  }

  /**
   * Invokes a tool exposed by the MCP server with optional arguments.
   *
   * Calls the specified tool with the provided arguments and returns the result as a
   * JSON string
   *
   * @returns A promise that resolves to the tool’s result serialized as a JSON string.
   *
   * @throws {Error} If the client is not connected or if the tool invocation fails.
   */
  async invokeTool(toolName: string, args?: Record<string, unknown>): Promise<string> {
    return await ArvoOpenTelemetry.getInstance().startActiveSpan({
      name: `McpSseClient.invokeTool<${toolName}@${this.serverUrl}>`,
      disableSpanManagement: true,
      context: this.parentOtelHeaders
        ? {
            inheritFrom: 'TRACE_HEADERS',
            traceHeaders: this.parentOtelHeaders,
          }
        : undefined,
      fn: async (span) => {
        logToSpan(
          {
            level: 'INFO',
            message: 'Invoking tool with arguments',
            args: JSON.stringify(args),
          },
          span,
        );
        try {
          if (!this.isConnected || !this.client) {
            throw new Error('MCP client not connected');
          }

          try {
            const result = await this.client.callTool({
              name: toolName,
              arguments: args,
            });
            return JSON.stringify(result);
          } catch (error) {
            const err = new Error(
              `Error occured while invoking MCP tool <${toolName}@${this.serverUrl}> -> ${(error as Error)?.message ?? 'Something went wrong'}`,
            );
            exceptionToSpan(err, span);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: err.message,
            });
            throw err;
          }
        } finally {
          span.end();
        }
      },
    });
  }
}
