import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const CreatingEvents: DemoCodePanel = {
  singlePanel: true,
  heading: 'Creating Events',
  description: cleanString(`
    The factory provides intuitive methods for creating both input and output events,
    with each method corresponding directly to the contract's structure. The API design
    mirrors the contract definition, making event creation predictable and discoverable
    through TypeScript IntelliSense.
    
    - **For input events,** use the \`.accepts()\` method, which corresponds to the contract's
    accepts field. The factory automatically determines the event type based on the
    contract specification, requiring only the source and data payload. 
    - **For output events,** use the \`.emits()\` method, which corresponds to the contract's
    emits field. Since contracts can define multiple output event types, you must specify
    which type you're creating.
    
    The factory validates that your data matches the schema
    for the specified event type and provides full type checking for all fields. 
    The subject field is optional and will be automatically generated if not provided, 
    ensuring proper event routing without manual intervention. You can
    optionally include execution metrics like \`executionunits\` to track computational
    cost or processing time associated with the event.
  `),
  tabs: [
    {
      title: 'contract.ts',
      lang: 'ts',
      code: `
// Create a factory instance bound to version 1.0.0 of the contract
// This factory will enforce v1.0.0 schemas for all events it creates
const eventFactoryV100 = createArvoEventFactory(userEnquiryContract.version('1.0.0'));

// Create an input event using .accepts() method
// The factory automatically sets the event type to 'com.user.enquiry' based on the contract
const serviceInputEventV100 = eventFactoryV100.accepts({
  source: 'test.test.test',  // Identifies the originating service
  data: {
    user_id: 'some-user-id',  // Must match the contract's accepts schema
  },
  // Note: 'subject' is auto-generated if not provided
  // Note: 'type' is automatically set to the contract's type field
});
// Generated event structure:
// {
//   "id": "3a7488c4-467c-4a87-9a66-06ca369446d5",           // Unique event identifier (auto-generated)
//   "source": "test.test.test",                              // Service that created the event
//   "specversion": "1.0",                                    // CloudEvents specification version
//   "type": "com.user.enquiry",                              // Event type (auto-set from contract)
//   "subject": "eJw9jUsKwzAMBe+idWJiYpI6t1FslQpim...",     // Auto-generated subject for event correlation
//   "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
//   "dataschema": "#/services/user/enquiry/1.0.0",          // References the contract version
//   "data": {
//     "user_id": "some-user-id"                              // Validated against contract schema
//   },
//   "time": "2025-10-10T16:08:18.542+00:00",                // Timestamp of event creation
//   "to": "com.user.enquiry",                                // Target handler (matches type)
//   "accesscontrol": null,                                   // Optional access control context
//   "redirectto": null,                                      // Optional redirection target
//   "executionunits": null,                                  // Optional computational cost tracking
//   "traceparent": null,                                     // OpenTelemetry W3C trace context
//   "tracestate": null,                                      // OpenTelemetry vendor-specific trace data
//   "parentid": null,                                        // ID of parent event if this is a response
//   "domain": null                                           // Optional domain classification
// }

// Create an output event using .emits() method
// This represents the successful response to the input event
const serviceOutputEventV100 = eventFactoryV100.emits({
  source: 'test.test.test',
  type: 'evt.user.enquiry.success',                         // Must match one of the contract's emit types
  subject: serviceInputEventV100.subject,                   // Reuse subject to maintain event correlation
  data: {
    user_id: serviceInputEventV100.data.user_id,            // Echo back the requested user_id
    name: 'John Doe',                                        // User details from database lookup
    dob: 'Feb 31, 1900',
    age: 125,
  },
  parentid: serviceInputEventV100.id,                       // Links this response to the input event
  executionunits: 1.3,                                      // Tracks processing cost (e.g., CPU seconds)
});
// Generated event structure:
// {
//   "id": "b03ce43b-936d-4a53-86bb-492978e52dd7",           // New unique ID for this event
//   "source": "test.test.test",
//   "specversion": "1.0",
//   "type": "evt.user.enquiry.success",                      // Specific emit type from contract
//   "subject": "eJw9jUsKwzAMBe+idWJiYpI6t1FslQpim...",     // Same subject maintains correlation chain
//   "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
//   "dataschema": "#/services/user/enquiry/1.0.0",
//   "data": {
//     "user_id": "some-user-id",
//     "name": "John Doe",
//     "dob": "Feb 31, 1900",
//     "age": 125
//   },
//   "time": "2025-10-10T16:08:18.546+00:00",
//   "to": "evt.user.enquiry.success",                        // Target matches the emit type
//   "accesscontrol": null,
//   "redirectto": null,
//   "executionunits": 1.3,                                   // Cost tracking included
//   "traceparent": null,
//   "tracestate": null,
//   "parentid": "3a7488c4-467c-4a87-9a66-06ca369446d5",     // References the input event's ID
//   "domain": null
// }

// Create a system error event for exception handling
// Error events follow a standardized format for consistent error propagation
const serviceErrorEvent = eventFactoryV100.systemError({
  source: 'test.test.test',
  subject: serviceInputEventV100.subject,                   // Maintains correlation with original request
  parentid: serviceInputEventV100.id,                       // Links error back to the failed request
  executionunits: 1.3,                                      // Cost incurred before failure
  error: new Error('Something went wrong'),                 // JavaScript Error object (auto-serialized)
});
// Generated error event structure:
// {
//   "id": "715317e8-6337-47d0-af59-016b2b5aefdd",
//   "source": "test.test.test",
//   "specversion": "1.0",
//   "type": "sys.com.user.enquiry.error",                    // Auto-prefixed with 'sys.' and suffixed with '.error'
//   "subject": "eJw9jUEKwyAQRe8y6yhq0tbkNkYndCAqNVpaJHfv...",
//   "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
//   "dataschema": "#/services/user/enquiry/0.0.0",          // Error events use version 0.0.0
//   "data": {
//     "errorName": "Error",                                  // Error class name
//     "errorMessage": "Something went wrong",                // Human-readable error message
//     "errorStack": "Error: Something went wrong <... stack trace>"  // Full stack trace for debugging
//   },
//   "time": "2025-10-10T16:21:11.915+00:00",
//   "to": "sys.com.user.enquiry.error",                      // System error handler target
//   "accesscontrol": null,
//   "redirectto": null,
//   "executionunits": 1.3,
//   "traceparent": null,
//   "tracestate": null,
//   "parentid": "3a7488c4-467c-4a87-9a66-06ca369446d5",     // References the input event's ID. References the event that caused the error
//   "domain": null
// }
  
 
`,
    },
  ],
};
