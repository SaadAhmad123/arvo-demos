# Arvo's Programming Paradigm

Arvo embodies a functional, event-driven programming paradigm that is distributed system compliant. 
Arvo is not an infrastructure layer tool and does not address those concerns. Arvo is not about how messages move or are delivery (they are infrastructure concerns); it is above how to structure application layer logic that is optimial in an asynchronous, distributed environment.

## Understanding the Paradigm

### Functional Programming Principles

At its core, Arvo applies functional programming principles to event-driven architecture. Handlers are conceptualized as pure transformations—functions that accept events as input and produce events as output. While handlers may perform side effects internally (database operations, API calls, computations, class instantiations, or any other imperative code), from the outside they appear as black boxes that transform one set of events into another.

This functional approach manifests in several key ways. Events are immutable data structures. Once created, an ArvoEvent cannot be modified; handlers can only create new events in response to existing ones. This immutability eliminates entire categories of bugs related to shared mutable state and makes event flows easier to reason about, test, and debug.

Composition happens through event emission rather than direct invocation. Handlers never call each other directly. Instead, they emit events that other handlers consume. This indirect composition creates loose coupling while maintaining system cohesion through contracts. A handler doesn't need to know which other handlers exist in the system—it only needs to know what events to emit according to its contract.

Some handlers coordinate workflows by emitting events to multiple other handlers and collecting their responses. These coordinating handlers (ArvoOrchestrator and ArvoResumable) maintain state between event processing cycles, but they're not architecturally special—they're still just event handlers that happen to orchestrate other handlers through event emission. When these handlers coordinate others, they treat those handlers as black boxes, only caring about the contract-defined event transformations, not the internal implementation details.

### Event-Driven Architecture

Arvo's event-driven nature means that communication between components happens exclusively through events. There are no synchronous API calls between handlers, no shared databases that multiple handlers read and write to simultaneously, and no global state that handlers coordinate around. Events are the sole mechanism for information flow.

This creates several important properties. Handlers operate independently, processing events on their own timeline without blocking other handlers. A slow handler doesn't prevent fast handlers from making progress. Failed handlers don't cascade failures to other parts of the system—the event simply gets reprocessed or routed to error handling.

The event-driven model also enables natural parallelism. Multiple handlers can process different events simultaneously without coordination. When a handler emits multiple events during processing, those events are handled concurrently by their respective target handlers. The emitting handler simply waits for all responses before proceeding with its next state transition.

Time becomes flexible in event-driven systems. A handler might process an event immediately, or that event might sit in a queue for hours before processing. The system's correctness doesn't depend on timing assumptions. This temporal decoupling is crucial for building resilient systems that tolerate variable latency, component failures, and operational maintenance windows.

### Distributed System Compliance

The critical distinction here is compliance versus implementation. Arvo doesn't implement distributed systems—it doesn't provide networking protocols, consensus algorithms, or service discovery mechanisms. Instead, Arvo structures your business logic so that it works correctly when deployed in distributed environments.

This compliance is achieved through deliberate design choices. Events carry all necessary metadata for distributed operation. The subject field provides correlation across service boundaries, enabling workflows that span multiple services to maintain context. The traceparent and tracestate fields support distributed tracing, allowing operations to be tracked across network hops and service boundaries. The to field enables content-based routing without requiring handlers to know about network topology.

Handlers are designed to be stateless between event processing cycles. When a handler finishes processing an event and emits responses, it releases all resources and can be terminated. The next event might be processed by a completely different handler instance, possibly on a different machine or in a different datacenter. This stateless design is fundamental to horizontal scalability and fault tolerance in distributed systems.

Some handlers maintain workflow state across multiple event processing cycles. These handlers use the IMachineMemory interface to persist state between events, which can be backed by any persistent store—Redis, DynamoDB, PostgreSQL, or any database that can implement the key-value contract. This abstraction means the same handler logic works whether state lives in local memory, a Redis cluster, or a distributed database across multiple regions. But even these stateful handlers follow the start-stop execution model: they process one event, persist state, release resources, and wait for the next event.

Failure handling is built into the event model. System error events (sys.*.error) propagate failures through the event fabric rather than through exception propagation or circuit breakers. A failed handler emits an error event that can be routed, logged, retried, or escalated according to your infrastructure policies. The business logic layer doesn't need to implement retry logic, exponential backoff, or dead letter queues—those are infrastructure concerns.

## Orchestration in the Paradigm

### Orchestration as Composition, Not Control

A fundamental aspect of Arvo's paradigm is how orchestration works. Unlike traditional workflow engines where orchestrators are privileged components that control workers, Arvo's orchestrators are simply handlers that coordinate other handlers through event emission. This distinction is crucial to understanding the paradigm.

When a handler needs to coordinate a workflow involving multiple other handlers, it doesn't invoke those handlers directly or control their execution. Instead, it:

1. Receives an initialization event
2. Emits events to the handlers it wants to coordinate
3. Processes response events as they arrive
4. Maintains workflow state between event processing cycles
5. Emits a completion event when the workflow finishes

Throughout this process, the orchestrating handler is just another participant in the event fabric. It registers with the broker using the same mechanism as any other handler. It communicates through contracts just like any other handler. It can fail, be restarted, or be replaced without special ceremony.

### Start-Stop Execution Model

The orchestration pattern follows Arvo's start-stop execution model strictly. An orchestrating handler doesn't run continuously while waiting for responses. Instead:

**On initialization event:**
- The handler processes the event
- Emits events to the handlers it wants to coordinate
- Persists its current workflow state (via IMachineMemory)
- Completes execution and releases all resources

**On response event:**
- A new (potentially different) instance of the handler starts
- Loads the persisted workflow state
- Processes the response event
- Updates workflow state based on the response
- Possibly emits more events or a completion event
- Persists the updated state
- Completes execution and releases resources

This start-stop pattern means orchestrating handlers consume zero resources while waiting for responses. They can coordinate workflows spanning minutes, hours, or days without holding open connections or occupying memory. Thousands of in-flight workflows can exist with minimal infrastructure cost.

### Two Orchestration Styles

Arvo provides two ways to express orchestration logic, but both follow the same underlying paradigm:

**Declarative Orchestration (ArvoOrchestrator with state machines):**
Workflow logic is defined as a state machine using XState. The machine declares states, transitions, and which events to emit in each state. The ArvoOrchestrator runtime executes this machine, handling the start-stop lifecycle, state persistence, and event routing automatically.

This style excels when workflows have clear, well-defined states and transitions. The declarative nature enables visualization tools, formal verification, and makes workflow logic explicit and reviewable.

**Imperative Orchestration (ArvoResumable):**
Workflow logic is written as regular TypeScript code with conditionals, loops, and imperative control flow. The handler decides what events to emit based on runtime conditions, previous responses, or external factors. The ArvoResumable runtime handles state persistence and resume-from-checkpoint behavior.

This style excels when workflows involve complex decision logic, AI-driven decisions, or dynamic behavior that's awkward to express as state transitions. It's particularly powerful for agentic AI scenarios where an LLM determines the next steps based on context.

**Despite the different programming models, both styles produce the same artifact: an ArvoEventHandler that coordinates other handlers through events.** The choice between them is about expressiveness and maintainability for your specific use case, not about architectural differences.

### Nesting and Composition

Because orchestrators are just handlers, they compose naturally. A handler coordinating a workflow can emit an initialization event to another orchestrating handler. The child handler processes its workflow independently, maintains its own state, and emits its completion event back. The parent handler receives this completion event like any other response and continues its workflow.

This nesting can be arbitrarily deep. State machine orchestrators can coordinate imperative orchestrators. Imperative orchestrators can coordinate state machines. Orchestrators can coordinate other orchestrators which themselves coordinate more orchestrators. The paradigm doesn't distinguish between "worker handlers" and "orchestrator handlers"—they're all just handlers coordinating through events.

The subject and parentSubject$$ fields in events enable this hierarchical coordination. Each orchestrator instance has a unique subject that identifies its workflow execution. When initializing a child orchestrator, the parent passes its subject as the parentSubject$$ value. This creates a correlation chain that links related workflows while maintaining independence between them.

### Why This Matters

The orchestration-as-handler pattern provides several critical properties:

**No architectural bottlenecks:** There's no central orchestration engine that all workflows must funnel through. Orchestrators scale independently like any other handler. If you have 100 active workflows, you have 100 independent handler instances (or fewer, with start-stop execution).

**Uniform deployment:** Orchestrators deploy using the same mechanisms as other handlers. They can run in the same process or be distributed across services. They don't require special infrastructure or deployment considerations.

**Composable workflows:** Complex workflows emerge from composing simple patterns. A workflow coordinating authentication, payment, and fulfillment is just a handler emitting events to three other handlers and collecting responses. If fulfillment itself requires coordinating inventory and shipping, that's another handler doing the same pattern one level down.

**Testable in isolation:** Test an orchestrating handler by mocking the response events from the handlers it coordinates. Test a handler by giving it events and verifying its responses. The uniform interface makes testing consistent across the system.

**Evolvable workflows:** Replace an orchestrating handler with a different implementation without affecting the handlers it coordinates. Convert a state machine orchestrator to an imperative one (or vice versa) without touching the workflow participants. The contract boundary protects both sides from implementation details.

**Agentic patterns:** The imperative orchestration style naturally supports AI agents. An LLM can be invoked directly within an orchestrating handler to decide which events to emit next. The agent becomes a standard participant in the event fabric, coordinating other handlers based on natural language instructions, runtime context, or learned behavior.

## Why This Paradigm Matters

### Separation of Concerns

The paradigm creates a clean separation between business logic and infrastructure concerns. Business logic engineers write handlers that process events according to contracts. They think about domain logic, validation rules, and workflow coordination. They don't think about message broker configuration, network partitioning, or deployment topology.

Platform engineers focus on infrastructure that routes events, persists state, handles failures, and scales to meet demand. They configure brokers, set up monitoring, tune performance, and manage operational concerns. They don't need to understand the business logic inside handlers to operate the system effectively.

This separation enables independent evolution. Business logic can be refactored, tested, and deployed without changing infrastructure. Infrastructure can be upgraded, migrated, or scaled without modifying handler code. Teams can work in parallel with clear boundaries of responsibility.

### Portability Across Environments

Because Arvo handlers are infrastructure-agnostic, they exhibit remarkable portability. The same handler code runs in development (with SimpleMachineMemory and an in-memory broker), in staging (with Redis and RabbitMQ), and in production (with DynamoDB and AWS SQS). Only the infrastructure configuration changes—the business logic remains identical.

This portability extends beyond environments to deployment models. A handler can run in a traditional server, a serverless function, a container orchestrated by Kubernetes, or even in a browser for client-side event processing. The programming model doesn't constrain deployment choices.

Migration between infrastructure becomes feasible. If you start with RabbitMQ and later need Kafka's throughput characteristics, you replace the broker without rewriting handlers. If you need to move from one cloud provider to another, the handlers move with you. The business logic investment is protected from infrastructure churn.

### Composability and Modularity

The functional, event-driven paradigm enables true composability. Handlers compose naturally through event emission. Some handlers coordinate other handlers by emitting events, not by holding references to handler objects or making RPC calls. This means coordinating handlers don't depend on the implementations of the handlers they coordinate—only on their contracts.

This compositional property enables workflows where handlers coordinate other handlers, which might themselves coordinate additional handlers. A handler can coordinate another handler simply by emitting its initialization event. The coordinated handler processes independently, emits its completion event, and the coordinating handler continues. There's no special coordination logic, no parent-child APIs—just events flowing according to contracts. All handlers participate as equals in the event fabric, regardless of whether they do direct work or coordinate other handlers.

Modularity emerges from contract boundaries. Each handler is an independent module with a clear interface defined by its contract. Handlers can be developed, tested, versioned, and deployed independently. A team can own a handler completely without coordinating with other teams beyond agreeing on contracts.

The system as a whole exhibits emergent properties from composing simple handlers. Complex workflows arise from combining handlers that each do one thing well. This modularity makes systems easier to understand, test, and evolve over time.

### Testability and Verification

The paradigm's properties make testing straightforward and comprehensive. Handlers are testable as pure functions. Create an input event, invoke the handler's execute method, verify the output events. No mocking of infrastructure, no test doubles for other handlers, no complex test harness required. The handler processes events—test that it does so correctly.

Contracts provide executable specifications that enable property-based testing. Generate random valid events according to the contract, verify the handler produces valid output events. Generate invalid events, verify the handler rejects them appropriately. The contract defines the property space, making verification systematic rather than ad hoc.

Handlers that coordinate other handlers are testable independently of the handlers they coordinate. Mock the service responses (events from other handlers), verify the coordinating handler emits the correct next events and maintains correct state. Test error paths, parallel executions, and complex conditionals without deploying actual handlers.

Integration testing happens at the broker level. Register real handlers with a test broker, emit events, verify the complete workflow produces expected outcomes. Because handlers share a uniform interface, integration tests compose naturally from unit-tested components.

The functional paradigm makes formal verification feasible for critical paths. State machines can be exhaustively verified for correctness, deadlock-freedom, and liveness properties. Contracts can be verified for compatibility during evolution. The paradigm's formal properties enable rigorous analysis when needed.

### Resilience and Fault Tolerance

Distributed system compliance means handlers naturally exhibit resilience properties. The stateless design means handler failures are isolated events, not cascading catastrophes. If a handler crashes mid-processing, another instance simply processes the event again. For handlers that maintain workflow state, that state lives in persistent memory (via IMachineMemory), not in the handler process, so it survives crashes.

The event-driven model provides natural retry semantics. If an event can't be processed (handler unavailable, transient error), the broker simply redelivers it. The handler doesn't need retry logic—infrastructure handles it. If an event consistently fails, the broker routes it to dead letter handling based on your infrastructure policies.

Error boundaries are explicit. System error events propagate failures through well-defined channels. Handlers that coordinate workflows can handle service failures gracefully, implementing compensation logic, alternative paths, or escalation procedures. Error handling is part of the workflow definition, not scattered through try-catch blocks.

Partial failures don't prevent progress. If one handler in a parallel workflow fails, other handlers continue processing. The coordinating handler collects whatever results are available and makes decisions based on partial information if needed. The system degrades gracefully rather than failing catastrophically.

The start-stop execution model enhances resilience for coordinating handlers. If an orchestrating handler crashes after emitting events but before persisting state, the worst case is re-emitting those events (which handlers should be designed to handle idempotently). When the handler restarts and processes the next response event, it loads the last persisted state and continues. Workflow progress is never lost because state checkpoints happen after each event processing cycle.

### Observability and Debugging

The paradigm provides inherent observability. Every interaction happens through events, creating a complete audit trail of system behavior. Events carry tracing headers that link operations across service boundaries. Following an event's journey through the system becomes straightforward—find the event by ID, follow the parent-child relationships, examine emitted events at each step.

Distributed tracing works naturally because events carry OpenTelemetry context. As events flow through handlers, spans are created automatically. The trace shows exactly which handlers processed which events, how long each took, what errors occurred, and what events were emitted. This visibility is built into the paradigm, not bolted on afterward.

Debugging becomes reproducible. Capture the input event that caused an issue, replay it through the handler locally. The functional nature means the handler should produce the same result given the same input. For orchestrating handlers, you can replay the entire sequence of events (initialization and responses) to reproduce the exact workflow execution that failed.

State machine-based handlers provide visual clarity. XState's tooling allows you to see the state machine visually, understand the possible transitions, and verify that your workflow logic is correct. This visualization capability emerges from the declarative nature of state machines and helps reason about complex coordination logic.

For imperative orchestrators, the explicit code flow makes debugging straightforward. Set breakpoints, inspect context, step through the decision logic. The code reads like regular TypeScript because it is regular TypeScript—no special orchestration DSL to learn.

## Paradigm in Practice

### Local Development

The paradigm's true power emerges in how it supports development workflows. During initial development, write handlers without any infrastructure. Use createArvoEventFactory to create events, call handler.execute directly, inspect results. The programming model works without brokers, databases, or distributed infrastructure.

Test handlers in isolation with simple unit tests. Create input events conforming to contracts, verify output events match expectations. No infrastructure setup required, no complicated test fixtures, no containers to spin up. The functional nature makes testing fast and straightforward.

As the system grows, introduce SimpleMachineMemory and SimpleEventBroker for integration testing. Multiple handlers coordinate through the in-memory broker. Handlers that maintain workflow state persist that state in memory. The full event-driven behavior emerges, but everything runs in one process with no external dependencies.

For orchestrating handlers, this local development approach is particularly valuable. You can test complex multi-step workflows entirely in memory. Emit the initialization event to the orchestrator, let the in-memory broker route events between handlers, observe the final completion event. The entire workflow executes locally with no infrastructure, making iteration fast and debugging straightforward.

This progression—from isolated handlers to coordinated workflows—happens entirely in your development environment. No cloud accounts required, no infrastructure to provision, no devops expertise needed to get started. The paradigm supports learning and experimentation with minimal friction.

### Incremental Scaling

When the system needs to scale, introduce infrastructure incrementally. Start by deploying all handlers in one Node.js process with a real message broker (RabbitMQ, Redis). Handlers coordinate through the broker instead of in-memory routing. No code changes—just different broker implementation.

Add persistent state storage by implementing IMachineMemory with Redis or PostgreSQL. Handlers that maintain workflow state persist to real databases instead of memory. Again, no handler code changes—just infrastructure configuration.

Split handlers into separate services when needed. Some handlers run in one process, others in different processes or on different machines. The broker routes events between them. Handler code remains unchanged—only deployment topology evolves.

Scale individual handlers independently based on load. CPU-intensive handlers get more instances. Handlers that maintain state might have fewer instances with sticky routing. The system scales heterogeneously based on actual needs, not uniform scaling across all components.

Orchestrating handlers scale like any other handler. If you have many concurrent workflows, deploy more orchestrator instances. The start-stop execution model means each instance only consumes resources while actively processing an event. Between events, the workflow state lives in persistent memory, and the handler instance can process other workflows or be terminated entirely.

This incremental path from single-process to distributed deployment is enabled by the paradigm's infrastructure independence. You don't rewrite for scale—you just add infrastructure that the paradigm already supports.

### Evolution and Maintenance

The paradigm supports system evolution through well-defined mechanisms. Contracts evolve through semantic versioning. Add new contract versions alongside existing ones. Handlers implement all contract versions they support. Consumers migrate to new versions at their own pace. No coordinated deployments required—the system supports multiple versions simultaneously.

Handlers evolve independently within contract boundaries. Refactor implementation, optimize algorithms, change dependencies—as long as the contract is satisfied, other handlers are unaffected. The contract boundary protects consumers from implementation churn.

Handlers that coordinate workflows can be replaced or refactored without disrupting the handlers they coordinate. A state machine-based handler can be rewritten as an imperative handler if that becomes more appropriate. The handlers it coordinates never know the difference—they just process events according to contracts.

This flexibility is particularly valuable for orchestration logic. Early in development, a simple imperative orchestrator might suffice. As the workflow becomes more complex, you might realize a state machine provides better clarity. Convert it without touching any of the handlers it coordinates. Later, if AI-driven orchestration becomes valuable, introduce an LLM that makes decisions about which events to emit. The coordinated handlers continue working unchanged because they only depend on contracts, not orchestration implementation.

Infrastructure can be replaced without touching business logic. Migrate from RabbitMQ to Kafka, from Redis to DynamoDB, from AWS to GCP—handlers continue working. The paradigm's separation of concerns protects business logic investment from infrastructure churn.

## Theoretical Foundations

### Why Functional Principles Work for Distribution

Functional programming principles align naturally with distributed systems constraints. Immutability eliminates coordination requirements. If data can't change, you don't need locks, transactions, or consensus protocols to coordinate access. Events being immutable means handlers can process them without coordinating with other handlers.

Pure functions enable deterministic replay. If a handler is truly a function of its input event, you can replay events to reproduce behavior. This enables debugging, testing, and disaster recovery patterns that would be impossible with stateful, side-effecting components at the boundaries.

Composition through values (events) rather than through reference (function calls) enables location transparency. It doesn't matter where a handler runs—it receives events and produces events. The broker handles routing. This location transparency is fundamental to distributed deployment.

### Why Events Work as Communication Primitives

Events as immutable messages provide several theoretical advantages. They decouple in time—producer and consumer don't need to be available simultaneously. They decouple in space—producer doesn't know consumer's location. They decouple in synchronization—producer doesn't block waiting for consumer.

Events create an audit trail automatically. Unlike RPC calls that leave no trace, events are durable artifacts. The system's behavior is explained by the sequence of events that occurred. This makes reasoning about distributed systems tractable.

Events enable natural parallelism without coordination overhead. Multiple consumers process different events simultaneously with no locking or coordination required. The event-driven model scales horizontally by adding more handler instances—no architectural changes needed.

Events support evolution through schema management. Contracts define event schemas and version them explicitly. Producers and consumers agree on contracts rather than on implementation details. This contract-based decoupling enables independent evolution.

### Why Infrastructure Independence Matters

Coupling business logic to infrastructure creates technical debt. When business rules are mixed with broker APIs, database drivers, and deployment assumptions, you can't change any piece independently. Infrastructure independence breaks this coupling.

The paradigm achieves independence through abstraction. Handlers depend on abstract interfaces (ArvoEvent, IMachineMemory, handler.execute) rather than concrete implementations (SQS, Redis, specific deployment topology). Concrete implementations satisfy these interfaces, but handlers never depend on them directly.

This creates option value. You're not locked into initial infrastructure choices. As requirements change, as new technologies emerge, as business needs evolve, you can adopt new infrastructure without discarding business logic. The option to change has real economic value.

Independence also enables best-of-breed infrastructure choices. Use Kafka where you need high throughput. Use RabbitMQ where you need sophisticated routing. Use SQS where you want managed services. Mix and match based on actual requirements rather than choosing one infrastructure for everything.

### Why Uniform Abstraction Matters

Every handler in Arvo—whether it does direct work or coordinates other handlers—is an ArvoEventHandler. They all accept ArvoEvent as input, return ArvoEvent[] as output, register with brokers the same way, and communicate through contracts. This uniformity eliminates architectural complexity.

There are no special categories, no privileged components, no central control points. Handlers compose with other handlers through events. Some handlers happen to coordinate workflows by emitting to multiple handlers and maintaining state, but they're not architecturally distinct. This flat architecture prevents the emergence of monolithic orchestrators that become bottlenecks or single points of failure.

The uniform abstraction makes the system comprehensible. Learn the handler pattern once, understand the entire system. There's no need to learn separate patterns for workers, orchestrators, coordinators, or controllers. Just handlers composing through events, all the way through.

This uniformity extends to failure modes, scaling characteristics, deployment patterns, and testing strategies. Everything you learn about operating one handler applies to all handlers. This conceptual simplicity is the paradigm's most powerful property—complexity doesn't grow with system size because the patterns remain constant.

## Conclusion

Arvo's functional, event-driven, distributed system compliant paradigm provides a coherent foundation for building reliable systems. The functional principles enable reasoning about correctness. The event-driven model enables loose coupling and natural parallelism. The distributed system compliance enables scaling from single-process to globally-distributed deployment. The uniform abstraction keeps the system comprehensible as it grows.

The orchestration pattern—where coordinating handlers are just event handlers that happen to maintain workflow state and emit to multiple targets—exemplifies the paradigm's power. There's no special orchestration layer, no privileged components. Just handlers composing through events, whether they're doing direct work or coordinating complex multi-step workflows involving dozens of other handlers.

This paradigm isn't revolutionary—it applies well-understood principles from functional programming and distributed systems to the practical problem of building business applications. The innovation is in making these principles accessible through a TypeScript toolkit that enforces them consistently while maintaining infrastructure independence and pragmatic flexibility in implementation.

Understanding the paradigm helps you leverage Arvo effectively. You're not just using an API—you're working within a coherent model that provides specific guarantees and enables specific patterns. The paradigm's properties emerge throughout the system, from local development to production deployment, creating a consistent experience across the entire lifecycle.