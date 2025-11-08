import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { v4 as uuid4 } from 'uuid';
import type { z } from 'zod';

/**
 * Context type for the event broker, providing registration, emission, and cleanup capabilities.
 *
 * @template T - Record of event names mapped to their Zod schema contracts
 */
export type EventBrokerContext<T extends Record<string, z.AnyZodObject>> = {
  /** Zod schema contracts defining the structure of each event type */
  contracts: T;
  /** Register a listener for a specific event type */
  register: {
    [K in keyof T]: (
      componentName: string,
      type: K,
      listener: (event: { type: K; data: z.infer<T[K]> }) => void,
    ) => string;
  }[keyof T];
  /** Emit an event to all registered listeners of that type */
  emit: (
    componentName: string,
    event: { [K in keyof T]: { type: K; data: z.infer<T[K]> } }[keyof T],
  ) => { success: boolean; errors: { source: 'zodValidation' | 'listener'; error: Error }[] };
  /** Unregister a listener by its unique ID */
  unregister: (id: string) => void;
};

/**
 * Creates a type-safe event broker for React components.
 *
 * This event broker enables direct component-to-component communication without prop drilling
 * or causing unnecessary context re-renders. It uses Zod schemas to ensure type safety for
 * event payloads at both compile-time and runtime.
 *
 * **Key Benefits:**
 * - Eliminates prop drilling through deeply nested component trees
 * - Prevents context re-renders that affect unrelated components
 * - Provides compile-time and runtime type safety for event data
 * - Enables loose coupling between components
 * - Includes debugging support with optional usage logging
 * - Automatic cleanup prevents memory leaks
 *
 * **When to Use:**
 * - Components need to communicate across different parts of the tree
 * - You want to avoid passing callbacks through many component layers
 * - Multiple components need to react to the same events
 * - You need type-safe event communication
 *
 * **When NOT to Use:**
 * - Simple parent-child communication (use props instead)
 * - Global state management (use Redux, Zustand, or React Context)
 * - One-off component interactions
 *
 * @template T - Record type mapping event names to their Zod schema contracts
 * @param config - Configuration object for the event broker
 * @param config.contracts - Zod schemas defining the structure of event data for each event type
 * @param config.logUsage - Optional flag to enable console logging of event registration, emission, and cleanup
 *
 * @returns Object containing Provider component and hooks for listening and emitting events
 *
 * @example
 * Basic usage with multiple event types:
 * ```typescript
 * import { z } from 'zod';
 *
 * const ChatEventBroker = createEventBroker({
 *   contracts: {
 *     userUpdated: z.object({
 *       id: z.string(),
 *       name: z.string(),
 *       email: z.string().email()
 *     }),
 *     messageReceived: z.object({
 *       id: z.string(),
 *       content: z.string(),
 *       timestamp: z.number()
 *     }),
 *     dataRefresh: z.object({
 *       timestamp: z.number(),
 *       source: z.enum(['api', 'websocket', 'manual'])
 *     })
 *   },
 *   logUsage: true // Enable debugging logs
 * });
 *
 * // Wrap your app with the Provider
 * function App() {
 *   return (
 *     <ChatEventBroker.Provider>
 *       <UserProfile />
 *       <MessageList />
 *       <RefreshButton />
 *     </ChatEventBroker.Provider>
 *   );
 * }
 *
 * // Listen for events in any component
 * function UserProfile() {
 *   const [user, setUser] = useState(null);
 *
 *   const handleUserUpdate = useCallback((event) => {
 *     setUser({ id: event.data.id, name: event.data.name });
 *   }, []);
 *
 *   ChatEventBroker.useListener('UserProfile', {
 *     type: 'userUpdated',
 *     listener: handleUserUpdate
 *   });
 *
 *   return <div>{user?.name}</div>;
 * }
 *
 * // Emit events from any component
 * function RefreshButton() {
 *   const emit = ChatEventBroker.useEmitter('RefreshButton');
 *
 *   const handleRefresh = () => {
 *     emit({
 *       type: 'dataRefresh',
 *       data: { timestamp: Date.now(), source: 'manual' }
 *     });
 *   };
 *
 *   return <button onClick={handleRefresh}>Refresh</button>;
 * }
 * ```
 */
export const createEventBroker = <T extends Record<string, z.AnyZodObject>>({
  contracts,
  logUsage = false,
}: { contracts: T; logUsage?: boolean }) => {
  const Context = createContext<EventBrokerContext<T>>({
    contracts,
    register: () => '',
    emit: () => ({ success: true, errors: [] }),
    unregister: () => {},
  });

  /**
   * Provider component that manages event listeners and enables event communication
   * between child components. Must wrap all components that need to use the event broker.
   *
   * The Provider maintains a registry of all active listeners and handles event routing.
   * It uses a ref to store listeners, preventing unnecessary re-renders when listeners
   * are added or removed.
   *
   * @param props - Provider props
   * @param props.children - Child components that can use the event broker hooks
   *
   * @example
   * ```typescript
   * <ChatEventBroker.Provider>
   *   <App />
   * </ChatEventBroker.Provider>
   * ```
   */
  const Provider: React.FC<{ children?: React.ReactNode | React.ReactNode[] }> = ({ children }) => {
    const listeners = useRef<
      Record<
        string,
        {
          [K in keyof T]: {
            componentName: string;
            type: K;
            listener: (event: { type: K; data: z.infer<T[K]> }) => void;
          };
        }[keyof T]
      >
    >({});

    return (
      <Context.Provider
        value={{
          contracts,
          register: (componentName, type, listener) => {
            const id = uuid4();
            if (logUsage) {
              console.log(
                `🔗 EventBroker: ${componentName} registered listener for "${String(type)}" [${id.slice(0, 8)}]`,
              );
            }

            listeners.current[id] = {
              componentName,
              type,
              listener,
            };
            return id;
          },
          emit: (fromComponentName, event) => {
            const matchingListeners = Object.values(listeners.current).filter(({ type }) => type === event.type);

            if (logUsage) {
              console.log(
                `📢 EventBroker: ${fromComponentName} emitted "${String(event.type)}" → ${
                  matchingListeners.length
                } listener(s)`,
                event.data,
              );
            }

            const resp = contracts[event.type].safeParse(event.data);
            if (resp.error) {
              return {
                success: false,
                errors: [
                  {
                    source: 'zodValidation',
                    error: resp.error,
                  },
                ],
              };
            }

            const errors: { source: 'listener'; error: Error }[] = [];
            for (const { componentName, listener } of matchingListeners) {
              if (logUsage) {
                console.log(`   → ${componentName}`);
              }
              try {
                listener(event);
              } catch (e) {
                errors.push({
                  source: 'listener',
                  error: e as Error,
                });
              }
            }

            if (logUsage && errors.length > 0) {
              console.error(`EventBroker: ${errors.length} error(s) occurred:`, errors);
            }

            return {
              success: errors.length === 0,
              errors,
            };
          },
          unregister: (id) => {
            const listenerInfo = listeners.current[id];
            if (!listenerInfo) return;

            if (logUsage) {
              console.log(
                `🔌 EventBroker: ${listenerInfo.componentName} unregistered from "${String(
                  listenerInfo.type,
                )}" [${id.slice(0, 8)}]`,
              );
            }

            delete listeners.current[id];
          },
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  /**
   * Hook to register an event listener in a component.
   *
   * The listener will be automatically registered when the component mounts and
   * unregistered when the component unmounts or when dependencies change.
   * This prevents memory leaks and ensures listeners are always up to date.
   *
   * **Important:** To avoid unnecessary re-registrations, wrap your listener function
   * with `useCallback` and include appropriate dependencies.
   *
   * @param componentName - Descriptive name of the component for debugging purposes
   * @param listener - Object containing the event type and listener function
   * @param listener.type - The event type to listen for (must match a key in contracts)
   * @param listener.listener - Function called when the event is emitted
   */
  const useListener = (
    componentName: string,
    listener: {
      [K in keyof T]: {
        type: K;
        listener: (event: { type: K; data: z.infer<T[K]> }) => void;
      };
    }[keyof T],
  ) => {
    const broker = useContext(Context);

    useEffect(() => {
      const id = broker.register(componentName, listener.type, listener.listener);
      return () => broker.unregister(id);
    }, [broker, componentName, listener.type, listener.listener]);
  };

  /**
   * Hook to get an event emitter function for a component.
   *
   * Returns a function that can emit events to all registered listeners of the specified type.
   * The emitted data is validated against the Zod contract at runtime to ensure type safety.
   *
   * @param componentName - Descriptive name of the component for debugging purposes
   * @returns Function to emit events with type-safe event objects
   */
  const useEmitter = (componentName: string) => {
    const broker = useContext(Context);
    // biome-ignore lint/correctness/useExhaustiveDependencies: No need for deps
    const emitter = useCallback((event: { [K in keyof T]: { type: K; data: z.infer<T[K]> } }[keyof T]) => {
      return broker.emit(componentName, event);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: No need for deps
    useEffect(() => {
      if (logUsage) {
        console.log(`An event emitter registered at component -> ${componentName}`);
      }
      return () => {
        if (logUsage) {
          console.log(`Event emitter de-registered from component -> ${componentName}`);
        }
      };
    }, []);

    return emitter;
  };

  const withProvider =
    <TProps extends object>(Component: React.FC<TProps>) =>
    (props: TProps) => (
      <Provider>
        <Component {...props} />
      </Provider>
    );

  return {
    Context,
    Provider,
    useListener,
    useEmitter,
    withProvider,
  };
};
