// import {
//   createArvoContract,
//   createArvoEvent,
//   createArvoEventFactory,
//   type VersionedArvoContract,
//   type InferArvoEvent,
//   type InferVersionedArvoContract,
// } from 'arvo-core';
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

// const orderCreateEvent = orderCreateEventFactory.accepts(
//   {
//     source: 'test.test.test',
//     data: {
//       items: ['Stationary', 'Electronics'],
//       id: '123-123-123',
//       address: 'Some address',
//     },
//   },
//   // Custom extension: Add optional extensions to the resultant ArvoEvent. This is a optional
//   // data and the maintainence onus is on the developer, Arvo will help as much as possible.
//   {
//     extension1: 'some.extension.string',
//   },
// );

// console.log(orderCreateEvent.toString(2)); // Returns the whole event as a JSON string
// console.log(JSON.stringify(orderCreateEvent.toJSON(), null, 2)); // the \`toJSON\` method return the JSON serializable object
// console.log(orderCreateEvent.toString(2) === JSON.stringify(orderCreateEvent.toJSON(), null, 2)); // This will log 'true' because the \`toString\` method encapsulated the \`JSON.stringify\` function

// console.log(orderCreateEvent.otelAttributes); // [Typed Object] This will log all the OpenTelemetry speced attributed which can be logged to OpenTelemetry spen. These attributes follow the official [OTEL Spec](https://opentelemetry.io/docs/specs/semconv/registry/attributes/cloudevents/)
// console.log(orderCreateEvent.cloudevent.default); // [Typed Object] This will log the basic CloudEvent speced event without Arvo or OTEL extensions

// console.log(orderCreateEvent.cloudevent.extensions); // [Type Object] All the extensions of the cloudevent including Arvo, Otel and customer extensions

// // Due to full Otel integration in Arvo, the event factories are also OTEL integrated and will populate
// // automatically the proper otel headers for distributed telemetry
// console.log({
//   otelHeaders: {
//     traceparent: orderCreateEvent.traceparent,
//     tracestate: orderCreateEvent.tracestate,
//   },
// });

// console.log(orderCreateEvent.id); // All the event attributes can also be accessed directly

// /**
//  *  This is the reconstructed event (after desceiralizartiom). Due to the nature
//  *  of this operations by default the typescript typing information of the event will be lost.
//  */
// const reconstructedEvent = createArvoEvent(JSON.parse(orderCreateEvent.toString()));

// // Tyoescripti operations

// type InferedArvoEvent = InferArvoEvent<typeof orderCreateEvent>;
// type InferedArvoContract = InferVersionedArvoContract<VersionedArvoContract<typeof orderCreateContract, '1.0.0'>>;
// type ContractInferedAcceptArvoEvent = InferedArvoContract['accepts']; // fully typed ArvoEvent type
// type ContractInferredEmitArvoEventUnionType = InferedArvoContract['emitList']; // A union type of all the events emitted by the contract excluding system error event
// type ContractInferedEmitArvoEventDictType = InferedArvoContract['emits']; // An object type of all emitted event.type enumeration -> ArvoEvent<...> excluding system erorr evnet
// type ContractInderedErrorArvoEvent = InferedArvoContract['systemError']; // The fully typed system error Arvoevent
