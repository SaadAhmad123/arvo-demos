import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

const label = 'createArvoEvent.ts';
export const CreateArvoEventTab: DemoCodePanel = {
  heading: 'Creating Your First ArvoEvent',
  description: cleanString(`
    In Arvo, an **ArvoEvent** is the core unit of communication between
    producers and consumers. It encapsulates structured data, metadata
    (such as source and subject), and routing information, making it both
    strongly typed and JSON-serializable.

    The \`arvo-core\` package provides multiple methods for creating events,
    depending on your use case. The most flexible option is the
    \`createArvoEvent\` function. It allows you to define your event's schema
    and type without requiring you to:
    - Conform to a specific \`ArvoContract\`
    - Generate a predefined event subject
    - Align your event creation to a downstream event handler

    While this approach offers high degree of flexibility, Arvo encourages more
    opinionated patterns (via contracts and event factories) to enforce
    consistency and validation across the system. These patterns are discussed 
    below.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { createArvoEvent } from 'arvo-core';

// Define the allowed event types for the following event
type OrderEventType = 'com.order.create';

// Define the schema for the event's data payload
type OrderCreateEvent = {
  items: string[];
  id: string;
  address: string;
};

/**
 * Creates a strongly-typed ArvoEvent instance
 * 
 * ArvoEvent<OrderCreateEvent, {}, "com.order.create">
 * 
 * This construction ensures type safety while maintaining JSON serialization
 * compatibility for seamless system integration.
 */
// biome-ignore lint/complexity/noBannedTypes: The empty {} type is required here to allow for custom extensions
const event = createArvoEvent<OrderCreateEvent, {}, OrderEventType>({
  type: 'com.order.create',
  subject: 'any_test_subject',     // Arbitrary subject identifier
  source: 'test.test.test',        // Identifies the source system
  data: {
    items: ['Stationary', 'Electronics'],
    id: '123-123-123',
    address: 'Some address',
  },
  to: 'com.order.create',          // Destination handler ID; usually matches the initial event type of the handler
});

`,
    },
  ],
};
