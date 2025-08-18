import React from 'react';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import CodeBlock from '../../../components/CodeBlock';
import { ContentContainer } from '../../../components/ContentContainer';
import { Separator } from '../../../components/Separator';

type PkgMap = Record<string, string>;
type PkgManager = 'pnpm' | 'npm' | 'yarn';

const PM_INSTALL_PREFIX: Record<PkgManager, { dev: string; prod: string }> = {
  pnpm: { dev: 'pnpm i --save-dev', prod: 'pnpm i' },
  npm: { dev: 'npm i --save-dev', prod: 'npm i' },
  yarn: { dev: 'yarn add -D', prod: 'yarn add' },
};

const withContinuations = (items: string[]) =>
  items.map((line, i) => ` ${line}${i === items.length - 1 ? '' : ' \\\n'}`).join('');

const mapToPkgLines = (pkgs: PkgMap, { forceVersion = true } = {}) =>
  Object.entries(pkgs).map(([name, ver]) => (ver || !forceVersion ? `${name}${ver ? `@${ver}` : ''}` : name));

const buildInstallTabs = (
  pkgs: PkgMap,
  { dev = false, titleSuffix = '' }: { dev?: boolean; titleSuffix?: string } = {},
) => {
  const lines = mapToPkgLines(pkgs);
  return (['pnpm', 'npm', 'yarn'] as PkgManager[]).map((pm) => ({
    lang: 'bash' as const,
    title: pm.toUpperCase() + (titleSuffix ? ` • ${titleSuffix}` : ''),
    code: `${PM_INSTALL_PREFIX[pm][dev ? 'dev' : 'prod']} \\\n${withContinuations(lines)}`,
  }));
};

const PREPARATION_PACKAGES: PkgMap = {
  typescript: '',
  '@biomejs/biome': '',
};

const ARVO_PACKAGES: PkgMap = {
  'arvo-core': '3.0.6',
  'arvo-event-handler': '3.0.6',
  zod: '3.25.67',
  xstate: '5.20.1',
  'zod-to-json-schema': '3.24.5',
};

const OTEL_BROWSER_PACKAGES: PkgMap = {
  '@opentelemetry/api': '1.9.0',
  '@opentelemetry/context-zone': '2.0.1',
  '@opentelemetry/exporter-zipkin': '2.0.1',
  '@opentelemetry/instrumentation': '0.203.0',
  '@opentelemetry/instrumentation-document-load': '0.48.0',
  '@opentelemetry/resources': '2.0.1',
  '@opentelemetry/sdk-trace-web': '2.0.1',
  '@opentelemetry/semantic-conventions': '1.36.0',
};

const OTEL_BROWSER_CODE_SNIPPET = `
// Run this code in your \`main.tsx\` or equivalent. This code sets up the OTEL
// connection to the OTEL collector
import {
  WebTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

// Setting it to false will log the telemetry data to broswer console
const exportToJaeger = true;

// Using Zipkin export to export logs to Jaeger
const httpExporter = new ZipkinExporter({
  url: 'http://localhost:9411/api/v2/spans',
  serviceName: 'web-frontend',
});

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'web-frontend',
  }),
  spanProcessors: [
    exportToJaeger ? 
      new BatchSpanProcessor(httpExporter) : 
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [],
});
`;

const OTEL_SERVER_PACKAGES: PkgMap = {
  '@opentelemetry/api': '1.9.0',
  '@opentelemetry/auto-instrumentations-node': '0.49.1',
  '@opentelemetry/core': '1.30.1',
  '@opentelemetry/exporter-metrics-otlp-proto': '0.52.1',
  '@opentelemetry/exporter-trace-otlp-grpc': '0.53.0',
  '@opentelemetry/exporter-trace-otlp-proto': '0.52.1',
  '@opentelemetry/resources': '1.25.1',
  '@opentelemetry/sdk-metrics': '1.25.1',
  '@opentelemetry/sdk-node': '0.52.1',
  '@opentelemetry/sdk-trace-node': '1.25.1',
  '@opentelemetry/semantic-conventions': '1.25.1',
};

export const Installation: React.FC = () => {
  return (
    <ContentContainer content>
      <div className={`${Md3Cards.inner.content} pb-0!`}>
        <h1 className={Md3Typography.headline.large}>Getting Started with Arvo</h1>
        <Separator padding={12} />
        <p className={Md3Typography.body.large}>
          This guide walks you through preparing your environment, installing Arvo, and configuring observability with
          OpenTelemetry (OTel). Follow the steps in order to get your Arvo application up and running quickly with full
          telemetry support.
        </p>
      </div>
      <Separator padding={16} />
      <Separator padding={16} />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className={Md3Cards.filled}>
          <div className={Md3Cards.inner.content}>
            <h2 className={Md3Typography.headline.large}>Preparation</h2>
            <Separator padding={8} />
            <p className={Md3Typography.body.medium}>
              Before setting up Arvo, make sure your development environment has the necessary tooling in place. These
              preparation steps install foundational developer tools (like TypeScript and Biome) that ensure your
              project is consistent and type-safe. They are required only for development and will not ship with your
              production build.
            </p>
          </div>
        </div>
        <CodeBlock tabs={buildInstallTabs(PREPARATION_PACKAGES, { dev: true })} />

        <div className={Md3Cards.filled}>
          <div className={Md3Cards.inner.content}>
            <h2 className={Md3Typography.headline.large}>Install Arvo</h2>
            <Separator padding={8} />
            <p className={Md3Typography.body.medium}>
              Once the environment is ready, install Arvo itself and its required core dependencies. This step brings in
              the main dependencies (Arvo core, event handling, and schema validation libraries like Zod) that form the
              foundation of an Arvo application.
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
            <h2 className={Md3Typography.headline.large}>Observability</h2>
            <Separator padding={8} />
            <p className={Md3Typography.body.medium}>
              Monitoring and observability are first-class features in Arvo through OpenTelemetry (OTel). Depending on
              whether you are building a browser-based app or running Arvo on the server, you need to install the
              corresponding OTel packages. This ensures you can capture traces, metrics, and logs from both the client
              and server side, helping you understand system performance and debug issues effectively.
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
            <h2 className={Md3Typography.headline.large}>Experience Telemetry</h2>
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
    </ContentContainer>
  );
};
