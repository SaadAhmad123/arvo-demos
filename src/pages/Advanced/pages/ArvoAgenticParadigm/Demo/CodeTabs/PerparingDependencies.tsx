import { cleanString } from '../../../../../../utils';
import {
  ARVO_PACKAGES,
  OTEL_BROWSER_PACKAGES,
  OTEL_SERVER_PACKAGES,
  buildInstallTabs,
} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const PreparingDependencies: DemoCodePanel = {
  singlePanel: true,
  heading: 'Prepare Your Environment',
  description: cleanString(`
    Let's begin by configuring your development environment for AI agent development with Arvo.
    Your setup extends the core requirements from the [Getting Started section](/),
    adding dependencies specific to AI agent workflows.

    The essential additions include Large Language Model SDKs and a robust observability stack.
    **For observability**, Arvo recommends the [OpenInference standard](https://arize.com/docs/ax/observe/tracing/tracing-concepts/openinference-semantic-conventions)
    for AI telemetry collection, ensuring vendor-neutral monitoring compatible with any 
    OTEL-compliant platform. For this guide, let's use [Arize Phoenix](https://phoenix.arize.com/),
    an open-source OTEL-compliant platform that natively captures OpenInference LLM metrics.
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
