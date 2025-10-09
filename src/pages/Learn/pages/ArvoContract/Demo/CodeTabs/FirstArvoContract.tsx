import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const FirstArvoContract: DemoCodePanel = {
  heading: 'Your First Contract',
  description: cleanString(`
    Let's create your first \`ArvoContract\` for a user registration service. The \`arvo-core\`
    package provides several factory methods for creating specialized contract instances.
    We'll start with \`createArvoContract\`, the foundational factory method that creates
    a pure \`ArvoContract\` instance without additional abstractions.

    This contract defines the complete interface specification for a service, including
    what events it accepts, what events it can emit, and how these events should be structured.
    When an event handler binds to this contract, it gains compile-time type safety and
    runtime validation, ensuring all communication adheres to the defined specification.

    This example demonstrates core contract concepts including versioning for evolution,
    input/output schema definitions using [Zod](https://zod.dev/), and explicit declaration of all possible
    event types the service can produce.

    ### Why This Matters?

    While TypeScript veterans might recognize similarities between \`ArvoContract\` and 
    standard TypeScript interfaces, contracts provide significantly more capability. 
    Beyond compile-time type safety and IDE intellisense, \`ArvoContract\` delivers 
    full runtime validation through [Zod](https://zod.dev/) schemas, ensuring data integrity at every stage 
    of event processing.

    The contract API extends beyond type checking to enable JSON specification generation 
    for human-readable documentation and AI agent integration. For agentic systems, 
    contracts provide structured metadata that enables AI to discover available services 
    and understand their invocation patterns without manual intervention.

    This simple contract definition fundamentally shapes the entire Arvo architecture. 
    Contracts enable type-safe \`ArvoEvent\` creation through specialized factory methods, 
    bind to event handlers to enforce validation and define trigger-response relationships, 
    and allow orchestrators to coordinate services by registering contracts rather than 
    coupling directly to implementations. This registration pattern enables orchestrators 
    to know which events trigger specific handlers and what responses to expect, maintaining 
    loose coupling while ensuring reliable service interaction.
  `),
  tabs: [
    {
      title: 'contract.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import z from 'zod';

// Create a contract that defines the input/output specification for the
// user registration service. This contract will be bound to an event handler,
// enforcing what events it can accept and emit.
export const userRegistrationHandlerContract = createArvoContract({
  // Unique identifier for this contract within the system
  uri: '#/demo/services/user/registration',

  // The event type this handler listens for and processes (this must be unique in the system as well)
  type: 'com.user.register',

  // Describes the service's purpose. Note: this describes the handler
  // that will bind to this contract, not the contract itself.
  description: 'This service handles the user registration in the system',

  // Contract versioning allows evolution while maintaining backward compatibility.
  // Handlers bound to this contract must support all defined versions simultaneously.
  versions: {
    '1.0.0': {
      // Input schema: defines the structure of events this handler accepts.
      // Corresponds to the 'data' field in incoming ArvoEvents.
      accepts: z.object({
        email: z.string().email('Must be a valid email'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),

      // Output schemas: defines all possible events this handler can emit.
      // Each key is an event type, and its value is the data structure
      // that event must contain.
      emits: {
        // Success case: user successfully registered
        'evt.user.registered': z.object({
          user_id: z.string(),
          email: z.string(),
          username: z.string(),
          created_at: z.string().datetime(),
        }),

        // Failure case: registration failed with error details
        'evt.user.registration.failed': z.object({
          reason: z.string(),
          error_code: z.enum(['EMAIL_EXISTS', 'USERNAME_TAKEN', 'INVALID_INPUT']),
        }),
      },
    },
  },
});
`,
    },
  ],
};
