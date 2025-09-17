// import { createArvoEvent } from 'arvo-core';

// // Arvo requires the \`event.type\` to strongly typed as well
// type OrderEventType = 'com.order.create';

// // Arvo requires the type of the \`event.data\` to be defined
// type OrderCreateEvent = {
//   items: string[];
//   id: string;
//   address: string;
// };

// // biome-ignore lint/complexity/noBannedTypes: This {} is necessary here for extensions
// const event = createArvoEvent<OrderCreateEvent, {}, OrderEventType>({
//   type: 'com.order.create',
//   subject: 'any_test_subject',
//   source: 'test.test.test',
//   data: {
//     items: ['Stationary', 'Electronics'],
//     id: '123-123-123',
//     address: 'Some address',
//   },
//   to: 'com.order.create', // The destination event handler source id. In Arvo, this is usually the \`event.type\` init event of the event handler
// });

// // The event has type \`ArvoEvent<OrderCreateEvent, {}, "com.order.create">\`
// // This allow the creation of a strongly typed JSON serializable event.
