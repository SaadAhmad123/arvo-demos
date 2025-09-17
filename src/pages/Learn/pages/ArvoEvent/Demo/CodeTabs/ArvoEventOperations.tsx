import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

const label = 'contract.ArvoEvent.ts';
export const ArvoEventOperations: DemoCodePanel = {
  heading: 'ArvoEvent Operations',
  description: cleanString(`
    At its core, an \`ArvoEvent\` is a JSON-compatible object that represents 
    a single unit of communication in Arvo. This raw format makes event exchange 
    across services simple and universal. However, relying solely on plain JSON 
    can quickly become repetitive, error-prone, and cumbersome for developers.

    To address this, the \`arvo-core\` package augments \`ArvoEvent\` with a 
    **comprehensive set of operations and utilities**. These APIs are designed to:
    - Provide multiple representations of the same event (e.g., JSON, stringified, CloudEvent)
    - Improve ergonomics by exposing direct field access (e.g., \`event.id\`) alongside 
      type-safe helpers such as \`toJSON()\` and \`toString()\`
    - Enable standardized interoperability with broader ecosystems (e.g., CloudEvents 
      compliance, OTEL trace headers)

    With these capabilities, events become more than simple messages—they serve as 
    **first-class, observable entities** in the codebase. This is particularly useful 
    when events need to be:
    - Logged or serialized in a consistent format
    - Exported to monitoring or observability platforms
    - Propagated across service boundaries with trace metadata
    - Extended with custom metadata while maintaining compliance with core specifications

    A **key design principle** is that all \`ArvoEvent\` fields are **immutable**. 
    Instead of mutating fields in place, developers produce new views or 
    serializations of the event. This ensures predictable, thread-safe behavior in 
    concurrent, distributed environments.

    Beyond runtime operations, Arvo also provides a set of **TypeScript utilities** 
    that enable strongly typed interactions with contracts and events. These utilities 
    allow developers to maintain full type safety across contracts 
    and event lifecycles, reducing errors while improving IDE feedback and developer 
    productivity.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import {
  createArvoContract,
  createArvoEvent,
  createArvoEventFactory,
  type VersionedArvoContract,
  type InferArvoEvent,
  type InferVersionedArvoContract,
} from 'arvo-core';
import { z } from 'zod';

// Define a contract for "order.create" events
const orderCreateContract = createArvoContract({
  uri: '#/demo/order/create',
  type: 'com.order.create',
  versions: {
    '1.0.0': {
      accepts: z.object({
        items: z.string().array(),
        id: z.string(),
        address: z.string(),
      }),
      emits: {
        'evt.order.create.done': z.object({
          id: z.string(),
          complete: z.boolean(),
        }),
        'evt.order.create.pending': z.object({
          id: z.string(),
          reason: z.string(),
        }),
      },
    },
  },
});

// Bind the factory to a contract version
const orderCreateEventFactory = createArvoEventFactory(
  orderCreateContract.version('1.0.0')
);

// Create an event with optional custom extensions
const orderCreateEvent = orderCreateEventFactory.accepts(
  {
    source: 'test.test.test',
    data: {
      items: ['Stationary', 'Electronics'],
      id: '123-123-123',
      address: 'Some address',
    },
  },
  {
    // Optional user-defined extensions.
    // Arvo integrates these where applicable.
    extension1: 'some.extension.string',
  },
);

// === Serialization utilities ===
console.log(orderCreateEvent.toString(2)); 
// -> Pretty-printed JSON string of the entire event

console.log(JSON.stringify(orderCreateEvent.toJSON(), null, 2)); 
// -> Equivalent JSON object (serializable form)

console.log(orderCreateEvent.toString(2) === JSON.stringify(orderCreateEvent.toJSON(), null, 2)); 
// -> true (toString internally uses JSON.stringify)


// === Interoperability utilities ===
console.log(orderCreateEvent.otelAttributes); 
// -> Typed object of OpenTelemetry attributes 
//    (follows the official [OTEL Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/cloudevents/))

console.log(orderCreateEvent.cloudevent.default); 
// -> CloudEvent-compliant representation of the event (without extensions)

console.log(orderCreateEvent.cloudevent.extensions); 
// -> All extensions combined: Arvo, OTEL, and user-defined


// === Distributed tracing integration ===
// Arvo automatically populates OpenTelemetry headers where applicable
console.log({
  otelHeaders: {
    traceparent: orderCreateEvent.traceparent,
    tracestate: orderCreateEvent.tracestate,
  },
});

// === Direct field access ===
console.log(orderCreateEvent.id); 
// -> Access top-level event attributes directly


// === Event reconstruction ===
/**
 * Rebuild an event from serialized JSON.
 * Note: type inference is not preserved after deserialization.
 */
const reconstructedEvent = createArvoEvent(
  JSON.parse(orderCreateEvent.toString())
);


// === TypeScript utilities ===

type InferredArvoEvent = InferArvoEvent<typeof orderCreateEvent>;
type InferredArvoContract = InferVersionedArvoContract<
  VersionedArvoContract<typeof orderCreateContract, '1.0.0'>
>;

type ContractInferredAcceptEvent = InferredArvoContract['accepts']; 
// Fully typed ArvoEvent for accepted input

type ContractInferredEmitUnion = InferredArvoContract['emitList']; 
// Union type of all emitted events (excluding system error events)

type ContractInferredEmitDict = InferredArvoContract['emits']; 
// Object map of event.type -> ArvoEvent (excluding system error events)

type ContractInferredErrorEvent = InferredArvoContract['systemError']; 
// Fully typed system error ArvoEvent
`,
    },
  ],
};
