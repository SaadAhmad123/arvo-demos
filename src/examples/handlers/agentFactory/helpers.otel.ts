import type { Span } from '@opentelemetry/api';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import type { AgenticMessageContent, AgenticToolDefinition, CallAgenticLLMOutput, CallAgenticLLMParam } from './types';

/**
 * Sets OpenInference-compliant attributes on an OpenTelemetry span for LLM input tracking.
 *
 * Configures detailed observability attributes following the OpenInference specification
 * for monitoring LLM operations. This function captures all input parameters sent to
 * the LLM including conversation history, available tools, and system prompts, enabling
 * comprehensive tracing and debugging of agentic workflows.
 */
export const openInferenceSpanInitAttributesSetter = (param: {
  span: Span;
  tools: AgenticToolDefinition[];
  messages: CallAgenticLLMParam['messages'];
  systemPrompt: string | null;
}) => {
  param.span.setAttributes({
    [OpenInferenceSemanticConventions.OPENINFERENCE_SPAN_KIND]: OpenInferenceSpanKind.LLM,
  });

  const toolDef = param.tools;

  param.span.setAttributes(
    Object.fromEntries(
      toolDef.flatMap((item, index) => [
        [
          `${OpenInferenceSemanticConventions.LLM_TOOLS}.${index}.${OpenInferenceSemanticConventions.TOOL_JSON_SCHEMA}`,
          JSON.stringify(item),
        ],
      ]),
    ),
  );

  param.span.setAttributes(
    Object.fromEntries(
      [
        ...(param.systemPrompt
          ? [
              {
                role: 'system',
                content: [{ type: 'text', content: param.systemPrompt ?? '' }] as AgenticMessageContent[],
              },
            ]
          : []),
        ...param.messages,
      ].flatMap((item, index) => {
        const attrs = [
          [
            `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_ROLE}`,
            item.role,
          ],
        ];
        for (let i = 0; i < item.content.length; i++) {
          const c = item.content[i];
          if (c.type === 'text') {
            attrs.push([
              `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.${i}.${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TYPE}`,
              c.type,
            ]);
            attrs.push([
              `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.${i}.${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TEXT}`,
              c.content,
            ]);
          }
          if (c.type === 'tool_use') {
            attrs.push([
              `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.${i}.${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_NAME}`,
              c.name,
            ]);
            attrs.push([
              `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.${i}.${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_ARGUMENTS_JSON}`,
              JSON.stringify({
                ...c.input,
                toolUseId$$: c.id,
              }),
            ]);
          }
          if (c.type === 'tool_result') {
            attrs.push([
              `${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.${index}.${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.${i}.${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TEXT}`,
              JSON.stringify({ result: c.content, toolUseId$$: c.tool_use_id }),
            ]);
          }
        }
        return attrs;
      }),
    ),
  );
};

/**
 * Sets OpenInference-compliant attributes on an OpenTelemetry span for LLM output tracking.
 *
 * Configures observability attributes for LLM response data following the OpenInference
 * specification. This function captures the complete LLM output including direct responses,
 * tool execution requests, and usage statistics, providing comprehensive visibility into
 * LLM decision-making and resource consumption.
 */
export const openInferenceSpanOutputAttributesSetter = ({
  span,
  response,
  toolRequests,
  usage,
}: CallAgenticLLMOutput & { span: Span }) => {
  span.setAttributes({
    [`${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.${OpenInferenceSemanticConventions.MESSAGE_ROLE}`]:
      'assistant',
  });
  if (response) {
    span.setAttributes({
      [`${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.${OpenInferenceSemanticConventions.MESSAGE_CONTENT}`]:
        typeof response === 'string' ? response : JSON.stringify(response),
    });
  }

  if (toolRequests?.length) {
    span.setAttributes(
      Object.fromEntries(
        toolRequests.flatMap((item, index) => [
          [
            `${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.${index}.${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_NAME}`,
            item.type,
          ],
          [
            `${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.${index}.${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_ARGUMENTS_JSON}`,
            JSON.stringify(item.data),
          ],
        ]),
      ),
    );
  }

  if (usage) {
    span.setAttributes({
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_PROMPT]: usage.tokens.prompt,
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_COMPLETION]: usage.tokens.completion,
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_TOTAL]: usage.tokens.completion + usage.tokens.prompt,
    });
  }
};
