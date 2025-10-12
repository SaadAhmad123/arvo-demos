import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const EventHandlerFactory: DemoCodePanel = {
  heading: 'Dependency Injection In Your Event Handlers',
  description: cleanString(`
    Real-world event handlers require shared dependencies to perform their operations 
    effectively. Common scenarios include providing database connections to multiple 
    handlers, sharing configuration objects across services, and distributing secrets 
    securely. Dependencies often vary by environment—local development might use 
    in-memory hash maps for key-value storage while production requires persistent 
    database implementations.

    Arvo addresses these patterns through the \`EventHandlerFactory\` type from the 
    \`arvo-event-handler\` package, establishing a consistent interface for dependency 
    injection across all event handlers and ensuring uniform implementation practices 
    throughout your system.

    Rather than directly instantiating handlers with \`createArvoEventHandler\`, 
    Arvo recommends that all services implement the \`EventHandlerFactory\` pattern, 
    regardless of whether they require dependency injection. This type-driven approach 
    provides several critical benefits including explicitly declaring all dependencies through 
    TypeScript's type system, enforcing consistent dependency management patterns across 
    your codebase, enabling environment-specific configuration without modifying handler 
    logic, and making dependency relationships clear and maintainable.

    The factory pattern separates handler definition from handler instantiation. You 
    define the handler once with its dependency requirements, then instantiate it with 
    environment-specific configurations at deployment time. This separation proves 
    particularly valuable when registering handlers with event brokers, where different 
    runtime environments require different dependency implementations without any changes 
    to the handler logic itself.
  `),
  tabs: [
    {
      title: 'create.user.handler.ts',
      lang: 'ts',
      code: `
import { type EventHandlerFactory, createArvoEventHandler } from 'arvo-event-handler';
import type { ArvoEvent } from 'arvo-core';
import { createSimpleEventBroker } from 'arvo-event-handler';

/**
 * Database configuration type defining all database-related dependencies.
 * 
 * This type groups related dependencies together, making it easier to
 * pass database concerns as a cohesive unit across handlers.
 */
export type DBConfig = {
    database: DatabaseClient;      // Database connection client
    config: {
        maxRetries: number;         // Connection retry attempts
        timeout: number;            // Query timeout in milliseconds
    };
    logger: Logger;                 // Structured logger instance
}

/**
 * User creation handler factory with explicit dependency injection.
 * 
 * The EventHandlerFactory<{dbConfig: DBConfig}> type signature:
 * - Declares that this factory requires a 'dbConfig' parameter
 * - Ensures type safety for all injected dependencies
 * - Makes dependency requirements explicit and discoverable
 * 
 * This pattern enables:
 * - Testing with mock implementations
 * - Environment-specific configuration (dev vs production)
 * - Centralized dependency management
 */
export const userCreateHandler: EventHandlerFactory<{dbConfig: DBConfig}> = ({
    dbConfig
}) => {
    // Destructure injected dependencies for convenient access
    const { database, config, logger } = dbConfig;

    // Return fully configured handler instance
    return createArvoEventHandler({
        contract: userCreateContract,       // Contract defining handler interface
        executionunits: 0,                  // Base operational cost
        handler: {
            // Version-specific handler implementation
            '1.0.0': async ({ event, span }) => {
                // Dependencies are available in handler scope
                logger.info('Processing user creation', {
                    userId: event.data.userId,
                    traceId: span?.spanContext().traceId
                });

                try {
                    // Use injected database client
                    const user = await database.createUser(event.data);

                    logger.info('User created successfully', { userId: user.id });

                    // Return success event
                    return {
                        type: 'evt.create.user.success',
                        data: { 
                            userId: user.id,
                            created: true 
                        }
                    };
                } catch (error) {
                    // Log error with injected logger
                    logger.error('User creation failed', { 
                        error: error.message,
                        eventId: event.id 
                    });
                    
                    // Re-throw to trigger system error event generation
                    throw error;
                }
            }
        }
    });
};

/**
 * index.ts (deployment entry point)
 * 
 * Deployment-time handler instantiation and broker configuration.
 * 
 * This demonstrates how factories are invoked at deployment time with
 * environment-specific dependencies. The separation between handler
 * definition (above) and instantiation (below) enables:
 * 
 * - Different configurations for dev/staging/production
 * - Runtime dependency injection without code changes
 * - Centralized configuration management
 */

// Create broker with instantiated handlers
// Each factory is called with its required dependencies
const executeBroker = async (event: ArvoEvent) =>
  await createSimpleEventBroker([
    addHandler,                              // From the previous example (no dependencies)
    userCreateHandler({                      // Instantiate with production config
      dbConfig: {
        database: new ProductionDatabaseClient({
          connectionString: process.env.DB_CONNECTION_STRING,
          poolSize: 10
        }),
        config: {
          maxRetries: 3,
          timeout: 10000
        },
        logger: new StructuredLogger({
          service: 'user-service',
          level: 'info',
          destination: 'cloudwatch'
        })
      }
    })
  ]).resolve(event);

/**
 * Alternative: Development configuration
 * 
 * Same handler factory, different dependencies for local development.
 * This demonstrates the flexibility of the factory pattern.
 */
const executeBrokerDev = async (event: ArvoEvent) =>
  await createSimpleEventBroker([
    addHandler,
    userCreateHandler({                      // Instantiate with dev config
      dbConfig: {
        database: new LocalDatabaseClient(), // In-memory or local DB
        config: {
          maxRetries: 1,
          timeout: 5000
        },
        logger: new ConsoleLogger()          // Simple console logging
      }
    })
  ]).resolve(event);


   
`,
    },
  ],
};
