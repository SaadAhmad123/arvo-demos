import { cleanString } from '../../../../../../utils';
import {
  ARVO_PACKAGES,
  buildInstallTabs,
  OTEL_BROWSER_PACKAGES,
  OTEL_SERVER_PACKAGES,
} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const PreparingDependencies: DemoCodePanel = {
  heading: 'Prepare Your Environment',
  description: cleanString(`
    Setting up your development environment is the foundation for building robust AI Agents with Arvo.
    This setup builds upon the core requirements outlined in the [Getting Started section](/),
    with additional dependencies specifically tailored for AI agent development.

    The key additions to the standard Arvo setup include integrating Large Language Model SDKs
    and establishing a comprehensive observability stack. This section utilize both
    [Anthropic](https://www.npmjs.com/package/@anthropic-ai/sdk/v/0.57.0) and 
    [OpenAI](https://www.npmjs.com/package/openai/v/5.22.0) SDKs to demonstrate versatile
    LLM integration patterns.

    To ensure optimal monitoring and debugging capabilities, this section implements observability
    through [Arize Phoenix](https://phoenix.arize.com/), a powerful OTEL-compliant platform
    that seamlessly captures LLM operation metrics. Phoenix leverages the 
    [OpenInference standard](https://arize.com/docs/ax/observe/tracing/tracing-concepts/openinference-semantic-conventions)
    for standardized telemetry data, providing deep insights into your AI agent's performance
    and behavior patterns.
  `),
  tabs: buildInstallTabs({
    ...{
      openai: '^5.22.0',
      '@anthropic-ai/sdk': '^0.57.0',
      '@arizeai/openinference-semantic-conventions': '^2.1.1',
      '@modelcontextprotocol/sdk': '^1.18.2',
    },
    ...ARVO_PACKAGES,
    ...OTEL_BROWSER_PACKAGES,
    ...OTEL_SERVER_PACKAGES,
  }),
};
