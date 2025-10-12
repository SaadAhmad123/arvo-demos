import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ObservabilityAndLogging: DemoCodePanel = {
  heading: 'Event Handler Observability',
  description: cleanString(`
    Arvo provides first-class support for observability through native OpenTelemetry 
    integration. Every event handler receives a \`span\` parameter representing the 
    current OpenTelemetry span, enabling distributed tracing across your entire 
    event-driven architecture without additional configuration.

    ## The Handler Context

    Each handler function receives three critical parameters:

    - \`event\`: The incoming \`ArvoEvent\` instance containing validated data
    - \`source\`: The handler's unique identifier (handler.source)
    - \`span\`: An OpenTelemetry \`Span\` object for distributed tracing

    The \`span\` parameter provides full access to OpenTelemetry's tracing capabilities, 
    allowing you to add custom attributes, record exceptions, set status codes, and 
    correlate operations across service boundaries.

    ## Structured Logging with logToSpan

    Arvo introduces \`logToSpan\`, a utility that integrates logging directly into 
    OpenTelemetry spans. This function transforms logging from isolated messages into 
    rich, traceable pieces of system observability. With \`logToSpan\`, you can:

    - Log messages with severity levels (DEBUG, INFO, WARN, ERROR)
    - Attach contextual information to log events
    - Automatically correlate logs with distributed traces
    - Choose between implicit (active span) or explicit (specified span) logging

    The utility abstracts span management complexities while providing consistent, 
    developer-friendly logging across your distributed system. Every log event becomes 
    a traceable component of your system's execution, enabling powerful observability 
    without cluttering business logic.

    ## Custom Span Attributes

    Beyond logging, you can enrich spans with custom attributes that capture 
    business-specific metrics, execution costs, user identifiers, or any contextual 
    information relevant to your domain. These attributes enhance trace analysis, 
    enable sophisticated monitoring queries, and provide valuable context during 
    incident investigation.
  `),
  tabs: [
    {
      title: 'user.create.handler.ts',
      lang: 'ts',
      code: `
import { createArvoContract, logToSpan, exceptionToSpan } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { SpanStatusCode } from '@opentelemetry/api';
import z from 'zod';

// Define contract for user creation service
export const userCreateContract = createArvoContract({
    uri: "#/services/user/create",
    type: "com.user.create",
    versions: {
        "1.0.0": {
            accepts: z.object({
                name: z.string(),
                email: z.string().email(),
                age: z.number(),
            }),
            emits: {
                "evt.user.create.success": z.object({
                    userId: z.string(),
                    created: z.boolean()
                })
            }
        }
    }
});

/**
 * User creation handler demonstrating comprehensive observability patterns.
 * 
 * This handler showcases:
 * - Custom span attribute injection
 * - Structured logging with logToSpan
 * - Error tracking and span status management
 * - Business metric recording
 */
export const userCreateHandler: EventHandlerFactory = () => createArvoEventHandler({
    contract: userCreateContract,
    executionunits: 1,
    handler: {
        '1.0.0': async ({ event, source, span }) => {
            // Handler parameters:
            // - event: ArvoEvent
            // - source: string (handler's unique identifier)
            // - span: Span (OpenTelemetry span for distributed tracing)

            // Add custom span attributes for enhanced observability
            // These attributes become searchable in your tracing backend
            span.setAttribute('service.name', source);
            span.setAttribute('user.email', event.data.email);
            span.setAttribute('user.age', event.data.age);
            span.setAttribute('event.id', event.id);

            // Implicit logging: uses the currently active span
            // logToSpan automatically finds the correct span context
            logToSpan({
                level: 'INFO',
                message: 'User creation process initiated',
            });

            try {
                // Log detailed operation start with structured data
                logToSpan({
                    level: 'INFO',
                    message: 'Validating user data',
                    data: {
                        email: event.data.email,
                        nameLength: event.data.name.length
                    }
                });

                // Simulate user creation logic
                const userId = await createUser(
                    event.data.name,
                    event.data.email,
                    event.data.age
                );

                // Record successful operation metrics
                span.setAttribute('user.id', userId);
                span.setAttribute('operation.success', true);

                // Explicit logging: specify target span directly
                // Useful when dealing with nested spans or concurrent operations
                logToSpan({
                    level: 'INFO',
                    message: 'User created successfully',
                    data: {
                        userId: userId,
                        processingTime: Date.now()
                    }
                }, span);

                // Mark span as successful with OpenTelemetry status code
                // This is internally managed by the \`ArvoEventHandler\`
                span.setStatus({
                    code: SpanStatusCode.OK,
                    message: 'User creation completed'
                });

                // Add business-specific execution cost tracking
                const executionCost = calculateExecutionCost(event.data);
                span.setAttribute('execution.cost', executionCost);

                return {
                    type: 'evt.user.create.success',
                    data: {
                        userId: userId,
                        created: true
                    },
                    executionunits: executionCost
                };

            } catch (error) {
                // Comprehensive error handling with observability
                // This is just for demonstration. More comprehensive
                // logging is implemented by the \`ArvoEventHandler\`
                // internally
                
                // Log error to the span 
                exceptionToSpan(error as Error, span)

                // Mark span as failed with appropriate status
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: \`User creation failed: \${error.message}\`
                });

                // Add error attributes for filtering in observability tools
                span.setAttribute('error.type', error.constructor.name);
                span.setAttribute('error.message', error.message);
                span.setAttribute('operation.success', false);

                // Re-throw to trigger system error event generation
                throw error;
            }
        }
    }
});

 
`,
    },
  ],
};
