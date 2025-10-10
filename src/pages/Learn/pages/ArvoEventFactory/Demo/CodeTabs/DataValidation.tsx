import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const DataValidation: DemoCodePanel = {
  heading: 'Data Validation & Error Handling',
  description: cleanString(`
    \`ArvoEventFactory\` implements a multi-layered validation strategy that catches errors
    at both compile-time and runtime. During development, TypeScript's type system provides
    immediate feedback through IDE warnings and compile-time errors, highlighting type
    mismatches and missing required fields before code execution. This static analysis is
    complemented by runtime validation using Zod schemas, which verify that actual data
    conforms to contract specifications during event creation.

    When validation fails, the factory provides detailed, actionable error messages that
    identify the specific field causing the issue, the expected type, the received value,
    and the exact path within the data structure. This precision enables rapid debugging
    by eliminating ambiguity about what went wrong and where.

    The factory also integrates seamlessly with OpenTelemetry for distributed tracing,
    automatically populating tracing headers in events while allowing manual override for
    specialized use cases. This ensures complete observability across event-driven workflows
    without requiring explicit tracing configuration in most scenarios.

    This example demonstrates how validation errors surface when data doesn't match
    the contract specification, showing both the attempted event creation and the resulting
    detailed error message that guides developers toward resolution.
  `),
  tabs: [
    {
      title: 'validation.ts',
      lang: 'ts',
      code: `
// Attempt to create an event with invalid data structure
// This example demonstrates what happens when required fields are missing
// and unexpected fields are present
try {
  eventFactoryV100.accepts({
    source: 'test.test.test',
    subject: 'some-unique-subject',
    data: {
      // @ts-ignore - Bypassing TypeScript's compile-time validation to demonstrate runtime behavior
      invalidField: 'unexpected value', // This field doesn't exist in the contract schema
      // Missing required field: 'user_id' - this will trigger validation failure
    },
  });
} catch (error) {
  // The factory throws detailed validation errors that include:
  console.error('Validation failed:', (error as Error).message);
}

// Detailed error output shows exactly what went wrong:
// Error: Accept Event data validation failed: [
//   {
//     "code": "invalid_type",           // Zod validation error code
//     "expected": "string",              // Contract expects a string type
//     "received": "undefined",           // Field was not provided
//     "path": [
//       "user_id"                        // Exact location of the error in the data structure
//     ],
//     "message": "Required"              // Human-readable explanation
//   }
// ]

// The error clearly identifies:
// 1. Which field is problematic: 'user_id'
// 2. What was expected: a string value
// 3. What was received: undefined (field missing entirely)
// 4. Why it failed: the field is required by the contract

// This level of detail eliminates guesswork and enables immediate fixes

 
`,
    },
  ],
};
