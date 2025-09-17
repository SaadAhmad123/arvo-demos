import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

const label = 'contract.ArvoEvent.ts';
export const ContractArvoEventTab: DemoCodePanel = {
  heading: 'Contract-First Development',
  description: cleanString(`
     Arvo promotes a **contract-first approach** to event-driven system design. 
    In this model, contracts define the formal interface between event producers 
    and consumers. Every \`ArvoEvent\` must comply with its associated contract, 
    ensuring reliable and consistent information exchange between event handlers.

    Unlike static documentation, Arvo contracts are **enforceable code objects** 
    called \`ArvoContract\`. A contract formally specifies:
    - The events a handler can accept
    - The events a handler can emit
    - The supported versions of the event specification (as detailed in the 
      [event handler documentation](/learn/arvo-event-handler), handlers must 
      maintain compliance with all versions declared in the contract)

    These contracts serve as **living specifications**, delivering both compile-time 
    safety and runtime validation. They give teams confidence in reasoning about 
    event flows and prevent mismatches across services.

    To simplify event creation, \`arvo-core\` provides dedicated 
    [event factories](/learn/arvo-event-factory). Factories are tied to a specific 
    contract version and automatically:
    - Infer the correct \`event.type\`
    - Generate a standardized \`event.subject\`
    - Derive the \`event.to\` field from the contract definition
    - Infer and assign the \`dataschema\` field
    - Enforce type validation at both compile time and runtime
    - Provide rich IntelliSense support to enhance developer productivity

    While factories are introduced here briefly, they are covered in greater detail 
    in the [dedicated documentation](/learn/arvo-event-factory). The key takeaway 
    is that **contracts and factories together enable a predictable, validated, and 
    strongly typed mechanism for creating and consuming events**.

    > **Note on the \`dataschema\` field:**
    The \`dataschema\` field is a core aspect of Arvo’s design. It acts as a canonical 
    reference to the schema version that validates a given event. By default, all 
    event factories infer it automatically in the format:
    \`{contract.uri}/{contract.version}\`.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { createArvoContract, createArvoEventFactory } from 'arvo-core';
import { z } from 'zod';

// Define a contract for "order.create" events
const orderCreateContract = createArvoContract({
  uri: '#/demo/order/create',
  type: 'com.order.create',
  versions: {
    // Contracts support versioning to evolve handler definitions safely
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

// Create a factory tied to the v1.0.0 contract
const orderCreateEventFactory = createArvoEventFactory(
  orderCreateContract.version('1.0.0')
);

// The dataschema field is automatically inferred as "#/demo/order/create/1.0.0"

/**
 * ACCEPTS event:
 * Strongly typed input event inferred from the contract.
 * The factory automatically sets event.type, subject, and destination.
 *
 * Resulting type:
 * ArvoEvent<{
 *   items: string[];
 *   id: string;
 *   address: string;
 * }, Record<string, any>, "com.order.create">
 * 
 * event.dataschema === "#/demo/order/create/1.0.0"
 */
const orderCreateEvent = orderCreateEventFactory.accepts({
  source: 'test.test.test',
  data: {
    items: ['Stationary', 'Electronics'],
    id: '123-123-123',
    address: 'Some address',
  },
});

/**
 * EMITS: success event
 * Resulting type:
 * ArvoEvent<{
 *   id: string;
 *   complete: boolean;
 * }, Record<string, any>, "evt.order.create.done">
 * 
 * event.dataschema === "#/demo/order/create/1.0.0"
 */
const orderCreateSuccessEvent = orderCreateEventFactory.emits({
  type: 'evt.order.create.done',
  source: 'com.order.create',
  data: {
    complete: true,
    id: '123-123-123',
  },
});

/**
 * EMITS: pending event
 * Resulting type:
 * ArvoEvent<{
 *   id: string;
 *   reason: string;
 * }, Record<string, any>, "evt.order.create.pending">
 * 
 * event.dataschema === "#/demo/order/create/1.0.0"
 */
const orderCreatePendingEvent = orderCreateEventFactory.emits({
  type: 'evt.order.create.pending',
  source: 'com.order.create',
  data: {
    reason: 'Just testing here',
    id: '123-123-123',
  },
});

/**
 * SYSTEM ERROR event
 * Contracts automatically include a standard error event definition with 
 * type: "sys.{iniEvent.type}.error"
 *
 * These always use a special reserved dataschema version "0.0.0", since the 
 * definition is consistent across all contract versions.
 * 
 * event.dataschema === "#/demo/order/create/0.0.0"
 */
const orderCreateErrorEvent = orderCreateEventFactory.systemError({
  source: 'com.order.create',
  error: new Error('Something went wrong'),
});


`,
    },
  ],
};
