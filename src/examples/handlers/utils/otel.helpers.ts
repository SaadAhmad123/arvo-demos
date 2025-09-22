import type { Span } from '@opentelemetry/api';
import type { AnyVersionedContract } from '../types';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import type { CallAgenticLLMOutput, CallAgenticLLMParam } from './types';

export const openInferenceSpanInitAttributesSetter = (param: {
  span: Span;
  tools: Record<string, AnyVersionedContract>;
  messages: CallAgenticLLMParam['messages'];
}) => {
  param.span.setAttributes({
    [OpenInferenceSemanticConventions.OPENINFERENCE_SPAN_KIND]: OpenInferenceSpanKind.LLM,
  });

  const toolDef = Object.values(param.tools).map((item) => {
    const inputSchema = item.toJsonSchema().accepts.schema;
    // @ts-ignore
    const { toolUseId$$, parentSubject$$, ...cleanedProperties } = inputSchema?.properties ?? {};
    // @ts-ignore
    const cleanedRequired = (inputSchema?.required ?? []).filter(
      (item: string) => item !== 'toolUseId$$' && item !== 'parentSubject$$',
    );
    return {
      name: item.accepts.type,
      description: item.description,
      input_schema: {
        ...inputSchema,
        properties: cleanedProperties,
        required: cleanedRequired,
      },
    };
  });

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
      param.messages.flatMap((item, index) => {
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
        response ?? '',
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
            JSON.stringify({
              ...item.data,
              toolUseId$$: item.id,
            }),
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
