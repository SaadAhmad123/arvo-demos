import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const UnderstandingEventFactory: DemoCodePanel = {
  heading: 'Creating An Event Factory',
  description: cleanString(`
    \`ArvoEventFactory\` provides an intelligent abstraction layer for event construction,
    enabling you to create \`ArvoEvent\` instances that automatically conform to 
    \`ArvoContract\` specifications. The factory manages the complexities of event 
    creation, including schema validation, default value population, type safety, and 
    structural consistency, allowing you to focus exclusively on your application's 
    essential data requirements.

    While instantiating \`ArvoEventFactory\` directly is possible, it requires verbose 
    configuration. Arvo provides the \`createArvoEventFactory\` helper function for more 
    ergonomic creation. This function accepts a specific contract version and returns a 
    factory instance pre-configured to that specification. The resulting factory 
    understands the contract's accept schema and emit events, automatically enforcing 
    type constraints and providing full TypeScript IntelliSense support.

    This example demonstrates, beyond straight forward contracts, a scenario where a contract evolves across 
    versions. The user enquiry contract starts with version 1.0.0 requiring only a 
    user ID, then evolves to version 2.0.0 adding regional context. By creating separate 
    factories for each version, you can maintain different event creation behaviors in 
    parallel, supporting gradual migration strategies or multi-version service deployments. 
    Each factory automatically handles its version-specific schema validation and event 
    structure requirements while you provide only the necessary data, ensuring that events 
    created through the factory are always contract-compliant.
  `),
  tabs: [
    {
      title: 'contract.ts',
      lang: 'ts',
      code: `
import { createArvoContract, createArvoEventFactory } from 'arvo-core';
import z from 'zod';

// Define a multi-version contract for user enquiry service
// This demonstrates contract evolution: v1.0.0 is the initial version,
// while v2.0.0 adds regional filtering capabilities
const userEnquiryContract = createArvoContract({
  uri: '#/services/user/enquiry',
  type: 'com.user.enquiry',
  versions: {
    // Version 1.0.0: Basic user lookup by ID
    '1.0.0': {
      // Input schema: accepts only user_id
      accepts: z.object({
        user_id: z.string(),
      }),
      // Output schemas: defines success event structure
      emits: {
        'evt.user.enquiry.success': z.object({
          user_id: z.string(),
          name: z.string(),
          dob: z.string(),
          age: z.number(),
        }),
      },
    },
    // Version 2.0.0: Enhanced with regional context
    '2.0.0': {
      // Input schema: adds mandatory region parameter
      accepts: z.object({
        user_id: z.string(),
        region: z.enum(['US', 'UK', 'AUD']),
      }),
      // Output schemas: maintains same success structure as v1.0.0
      emits: {
        'evt.user.enquiry.success': z.object({
          user_id: z.string(),
          name: z.string(),
          dob: z.string(),
          age: z.number(),
        }),
      },
    },
  },
});

// Create factory for version 1.0.0
// This factory will validate inputs against the v1.0.0 accepts schema
// and provide type-safe event creation for v1.0.0 emit events
const eventFactoryV100 = createArvoEventFactory(userEnquiryContract.version('1.0.0'));

// Create factory for version 2.0.0
// This factory enforces the additional 'region' field requirement
// while maintaining the same output event structure
const eventFactoryV200 = createArvoEventFactory(userEnquiryContract.version('2.0.0'));

 
`,
    },
  ],
};
