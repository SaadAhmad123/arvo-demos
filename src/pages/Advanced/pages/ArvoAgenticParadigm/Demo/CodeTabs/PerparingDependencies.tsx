import { cleanString } from '../../../../../../utils';
import { ARVO_PACKAGES, buildInstallTabs } from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const PreparingDependencies: DemoCodePanel = {
  singlePanel: true,
  heading: 'Getting Started',
  description: cleanString(`
    Getting started with \`ArvoAgent\` does not require adopting the entire Arvo event-driven architecture. 
    Since \`ArvoAgent\` is built on Arvo's core primitives, you can add the required dependencies to your 
    existing application and start using it immediately. As your needs grow and you build more sophisticated 
    systems, you can progressively explore Arvo's additional capabilities and incorporate what you need.

    All you need is a NodeJS runtime. Infrastructure details like brokers, persistence backends, and 
    observability platforms are pluggable concerns that can be configured later. You can follow the 
    [installation](/#installation) documentation to understand all available dependencies, installation 
    options, and OpenTelemetry setup. For this tutorial, we will install only the core dependencies 
    needed to explore Arvo's agentic paradigm. Refer to the installation documentation for comprehensive details 
    on each dependency and advanced configuration options.
  `),
  tabs: buildInstallTabs({
    ...{
      '@arvo-tools/agentic': '^1.2.9',
    },
    ...ARVO_PACKAGES,
  }),
};
