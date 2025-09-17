// import { createArvoContract, createArvoEventFactory } from 'arvo-core';
// import { z } from 'zod';

// const orderCreateContract = createArvoContract({
//   uri: '#/demo/order/create',
//   type: 'com.order.create',
//   versions: {
//     '1.0.0': {
//       accepts: z.object({
//         items: z.string().array(),
//         id: z.string(),
//         address: z.string(),
//       }),
//       emits: {
//         'evt.order.create.done': z.object({
//           id: z.string(),
//           complete: z.boolean(),
//         }),
//         'evt.order.create.pending': z.object({
//           id: z.string(),
//           reason: z.string(),
//         }),
//       },
//     },
//   },
// });

// const orderCreateEventFactory = createArvoEventFactory(orderCreateContract.version('1.0.0'));

// /**
//  * This event is just as strongly typed as the previous one
//  * but is also automatically infers the event.type, generates
//  * Arvo standard event.subject and sets the event.to by infering
//  * from the contract as well (with the assumption that the target
//  * event handler is an Arvo event handler)
//  *
//  * Furthermore, this method enforces type checking on compile and run time
//  * as well as provides excellet intellisense
//  * ArvoEvent<{
//     items: string[];
//     id: string;
//     address: string;
// }, Record<string, any>, "com.order.create">
//  */
// const orderCreateEvent = orderCreateEventFactory.accepts({
//   source: 'test.test.test',
//   data: {
//     items: ['Stationary', 'Electronics'],
//     id: '123-123-123',
//     address: 'Some address',
//   },
// });

// /**
//  * type =>
//  * ArvoEvent<{
//     id: string;
//     complete: boolean;
// }, Record<string, any>, "evt.order.create.done">
//  */
// const orderCreateSuccessEvent = orderCreateEventFactory.emits({
//   type: 'evt.order.create.done',
//   source: 'com.order.create', // The service event handler's `handler.source`
//   data: {
//     complete: true,
//     id: '123-123-123',
//   },
// });

// /**
//  * type
//  * ArvoEvent<{
//     id: string;
//     reason: string;
// }, Record<string, any>, "evt.order.create.pending">
//  */
// const orderCreatePendingEvent = orderCreateEventFactory.emits({
//   type: 'evt.order.create.pending',
//   source: 'com.order.create', // The service event handler's `handler.source`
//   data: {
//     reason: 'Just testing here',
//     id: '123-123-123',
//   },
// });

// /**
//  * type =>
//  * ArvoEvent<{
//     errorName: string;
//     errorMessage: string;
//     errorStack: string | null;
// }, Record<string, any>, "sys.com.order.create.error">
//  * The ArvoContract automatically provides a standard error event
//  */
// const orderCreateErrorEvent = orderCreateEventFactory.systemError({
//   source: 'com.order.create',
//   error: new Error('Some thing went wrong'),
// });
