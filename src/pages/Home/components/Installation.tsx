import React from 'react';
import { Md3ContentPadding } from '../../../classNames';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import CodeBlock from '../../../components/CodeBlock';
import { ContentContainer } from '../../../components/ContentContainer';
import { Label } from '../../../components/Label';
import { ReMark } from '../../../components/ReMark';
import { Separator } from '../../../components/Separator';
import { cleanString } from '../../../utils';

export type PkgMap = Record<string, string>;
export type PkgManager = 'pnpm' | 'npm' | 'yarn';

export const PM_INSTALL_PREFIX: Record<PkgManager, { dev: string; prod: string }> = {
  pnpm: { dev: 'pnpm i --save-dev', prod: 'pnpm i' },
  npm: { dev: 'npm i --save-dev', prod: 'npm i' },
  yarn: { dev: 'yarn add -D', prod: 'yarn add' },
};

export const withContinuations = (items: string[]) =>
  items.map((line, i) => ` ${line}${i === items.length - 1 ? '' : '\\\n'}`).join('');

export const mapToPkgLines = (pkgs: PkgMap, { forceVersion = true } = {}) =>
  Object.entries(pkgs).map(([name, ver]) => (ver || !forceVersion ? `${name}${ver ? `@${ver}` : ''}` : name));

export const buildInstallTabs = (
  pkgs: PkgMap,
  params: { showNodeVersion?: boolean; dev?: boolean; titleSuffix?: string } = {},
) => {
  const { showNodeVersion = false, dev = false, titleSuffix = '' } = params;
  const lines = mapToPkgLines(pkgs);
  return (['pnpm', 'npm', 'yarn'] as PkgManager[]).map((pm) => ({
    lang: 'bash' as const,
    title: pm.toUpperCase() + (titleSuffix ? ` • ${titleSuffix}` : ''),
    code: `${showNodeVersion ? '# Use Node version 19 or above for Arvo. You can put this version in .nvmrc for future use.\n# nvm i 19 # Use this command to install the Node version\nnvm use 19\n' : ''}${PM_INSTALL_PREFIX[pm][dev ? 'dev' : 'prod']} \\\n${withContinuations(lines)}`,
  }));
};

export const PREPARATION_PACKAGES: PkgMap = {
  typescript: '',
  '@biomejs/biome': '',
};

export const ARVO_PACKAGES: PkgMap = {
  'arvo-core': '^3.0.25',
  'arvo-event-handler': '^3.0.25',
  zod: '^3.25.74',
  xstate: '5.24.0',
  'zod-to-json-schema': '^3.25.0',
};

export const OTEL_BROWSER_PACKAGES: PkgMap = {
  '@opentelemetry/api': '^1.9.0',
  '@opentelemetry/context-zone': '^2.1.0',
  '@opentelemetry/exporter-trace-otlp-http': '^0.205.0',
  '@opentelemetry/instrumentation': '^0.205.0',
  '@opentelemetry/instrumentation-document-load': '^0.50.0',
  '@opentelemetry/resources': '^2.1.0',
  '@opentelemetry/sdk-trace-web': '^2.1.0',
  '@opentelemetry/semantic-conventions': '^1.37.0',
};

const OTEL_BROWSER_CODE_SNIPPET = `
// Run this code in your application \`index.tsx\` or equivalent. In case of NextJS
// see NextJS Otel documentation. This code sets up the OTEL connection to the OTEL collector
import { WebTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter as HTTPExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Setting it to false will log the telemetry data to broswer console
const exportToJaeger = true;
const serviceName = 'arvo-browser';

const httpExporter = new HTTPExporter({
  url: 'http://localhost:4318/v1/traces',   // Jaeger HTTP Trace endpoint
});

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  spanProcessors: [
    exportToJaeger ? new SimpleSpanProcessor(httpExporter) : new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [],
});
`;

export const OTEL_SERVER_PACKAGES: PkgMap = {
  '@opentelemetry/api': '^1.9.0',
  '@opentelemetry/auto-instrumentations-node': '^0.62.1',
  '@opentelemetry/exporter-trace-otlp-grpc': '^0.203.0',
  '@opentelemetry/resources': '^2.0.1',
  '@opentelemetry/sdk-metrics': '^2.0.1',
  '@opentelemetry/sdk-node': '^0.203.0',
  '@opentelemetry/sdk-trace-node': '^2.0.1',
  '@opentelemetry/semantic-conventions': '^1.38.0',
};

const OTEL_SERVER_CODE_SNIPPET = `
import { OTLPTraceExporter as GRPCTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Setting it to false will log the telemetry data to broswer console
const exportToJaeger = true;
const serviceName = 'arvo-node';

// The GRPC export is responsible to export telemetry data to the 
// OTel collector (in this case Jaeger)
const grpcExporter = new GRPCTraceExporter();

export const telemetrySdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  spanProcessors: [
    exportToJaeger ? new BatchSpanProcessor(grpcExporter) : new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
  instrumentations: [getNodeAutoInstrumentations()], // Comment this out - if you only want to see Arvo traces
});

// Call this function in your application 'index.ts'
export const telemetrySdkStart = () => {
  telemetrySdk.start();
};

export const telemetrySdkStop = async () => {
  await telemetrySdk.shutdown();
};
`;

export const Installation: React.FC = () => {
  return (
    <>
      <ContentContainer content>
        <div id='getting-started' className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Getting Started with Arvo  

              Getting started with Arvo is straightforward and accessible. As an application-tier 
              toolkit that abstracts event-driven architectural and infrastructure concerns, Arvo 
              distinguishes itself from other tools in the ecosystem by enabling you to begin 
              experimentation and development immediately within a simple console application 
              while maintaining a structure that seamlessly scales across diverse execution 
              environments, from basic NodeJS applications to serverless distributed infrastructure.


              # Installation

              The following guide walks you through preparing your environment, installing Arvo, and configuring 
              observability with OpenTelemetry (OTel). Follow these steps sequentially to establish your 
              Arvo application with comprehensive telemetry support. Alternatively, you can [clone Arvo's 
              sample project from GitHub](https://github.com/SaadAhmad123/arvo-example-project) for an accelerated start.
          `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer>
        <div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className={Md3Cards.filled}>
              <div className={Md3Cards.inner.content}>
                <ReMark content={'# Preparation'} />
                <Separator padding={8} />
                <p className={Md3Typography.body.medium}>
                  Before setting up Arvo, make sure your development environment has the necessary tooling in place.
                  These preparation steps install foundational developer tools (like TypeScript and Biome) that ensure
                  your project is consistent and type-safe. They are required only for development and will not ship
                  with your production build.
                </p>
              </div>
            </div>
            <CodeBlock tabs={buildInstallTabs(PREPARATION_PACKAGES, { dev: true, showNodeVersion: true })} />

            <div className={Md3Cards.filled}>
              <div className={Md3Cards.inner.content}>
                <ReMark content={'# Install Arvo'} />
                <Separator padding={8} />
                <p className={Md3Typography.body.medium}>
                  Once the environment is ready, install Arvo itself and its required core dependencies. This step
                  brings in the main dependencies (Arvo core, event handling, and schema validation libraries like Zod)
                  that form the foundation of an Arvo application.
                </p>
                <Separator />
                <p className={`${Md3Typography.body.small} opacity-75`}>
                  <strong>Note:</strong> If you want to run Arvo in the browser, you will also need to install a Node{' '}
                  <code>Buffer</code> polyfill, since the <code>Buffer</code> class does not exist in the browser
                  environment.
                </p>
              </div>
            </div>
            <CodeBlock tabs={buildInstallTabs(ARVO_PACKAGES)} />

            <div className={Md3Cards.filled}>
              <div className={Md3Cards.inner.content}>
                <Label content='Optional' />
                <ReMark content={'# Observability'} />
                <Separator padding={8} />
                <p className={Md3Typography.body.medium}>
                  Monitoring and observability are first-class features in Arvo through OpenTelemetry (OTel). Depending
                  on whether you are building a browser-based app or running Arvo on the server, you need to install the
                  corresponding OTel packages. This ensures you can capture traces, metrics, and logs from both the
                  client and server side, helping you understand system performance and debug issues effectively.
                </p>
              </div>
            </div>
            <CodeBlock
              tabs={[
                {
                  lang: 'bash' as const,
                  title: 'Server',
                  code: `${PM_INSTALL_PREFIX.pnpm.prod} \\\n${withContinuations(mapToPkgLines(OTEL_SERVER_PACKAGES))}`,
                },
                {
                  lang: 'ts' as const,
                  title: 'Server Config (otel.ts)',
                  code: OTEL_SERVER_CODE_SNIPPET.trim(),
                },
                {
                  lang: 'bash' as const,
                  title: 'Client',
                  code: `${PM_INSTALL_PREFIX.pnpm.prod} \\\n${withContinuations(mapToPkgLines(OTEL_BROWSER_PACKAGES))}`,
                },
                {
                  lang: 'ts' as const,
                  title: 'Client Config (otel.ts)',
                  code: OTEL_BROWSER_CODE_SNIPPET.trim(),
                },
              ]}
            />

            <div className={Md3Cards.filled}>
              <div className={Md3Cards.inner.content}>
                <Label content='Optional' />
                <ReMark content={'# Experience Telemetry'} />
                <Separator padding={8} />
                <p className={Md3Typography.body.medium}>
                  To view and analyze the telemetry data collected from Arvo, you need an OTel backend. While production
                  environments typically use a dedicated collector, during local development you can spin up Jaeger in a
                  single Docker container. Jaeger provides a simple UI to visualize traces, which is invaluable for
                  debugging and ensuring your observability pipeline is working correctly.
                </p>
              </div>
            </div>
            <CodeBlock
              tabs={[
                {
                  lang: 'bash' as const,
                  title: 'Jaeger (Docker)',
                  code: [
                    '# Start Jaeger all‑in‑one locally',
                    'docker run --rm \\',
                    '  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \\',
                    '  -p 16686:16686 \t# Web UI',
                    '  -p 4317:4317   \t# OTLP gRPC',
                    '  -p 4318:4318   \t# OTLP HTTP',
                    '  -p 9411:9411   \t# Zipkin',
                    '  jaegertracing/all-in-one:latest',
                  ].join('\n'),
                },
              ]}
            />
          </div>
        </div>
      </ContentContainer>
    </>
  );
};
