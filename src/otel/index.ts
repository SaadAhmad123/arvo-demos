import { WebTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter as HTTPExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as ProtoBufExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SEMRESATTRS_PROJECT_NAME } from '@arizeai/openinference-semantic-conventions';

const collectorType: 'external' | 'console' = 'console';
const serviceName = 'arvo-browser';

const jaegerExporter = new HTTPExporter({
  url: 'http://localhost:6001/jaeger/v1/traces',
});

const arizePhoenixExporter = new ProtoBufExporter({
  url: 'http://localhost:6001/arize/v1/traces',
});

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [SEMRESATTRS_PROJECT_NAME]: serviceName,
  }),
  spanProcessors:
    collectorType !== 'console'
      ? [new SimpleSpanProcessor(new ConsoleSpanExporter())]
      : [new SimpleSpanProcessor(jaegerExporter), new SimpleSpanProcessor(arizePhoenixExporter)],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [],
});
