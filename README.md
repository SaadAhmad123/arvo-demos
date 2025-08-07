---
[Hero Section]
- Headline: "Arvo - A Toolkit for Service Choreography"
- Subheading: "Build reliable, evolutionary event-driven applications that scale from simple microservices to complex distributed workflows"
- CTA Buttons: [Get Started] [View Documentation] [GitHub]

[Core Value Props - 3 columns]
1. "Simplicity Through Composition"
2. "Built-in Reliability" 
3. "Evolutionary Architecture"

[Second Hero]
"Start Simple, Scale Naturally"

[Quick Start Section]
- Code snippet showing basic usage
- Link to Getting Started guide
---

# Arvo - A Toolkit for Service Choreography

Arvo is an enterprise-grade Node.js standard library for building reliable, evolutionary event-driven applications that scale from simple microservices to complex distributed workflows and agents.

#### Simplicity Through Composition
 
Arvo provides focused, composable primitives that work together seamlessly across all complexity levels. Whether you're building a single stateless service or orchestrating complex multi-agent/service workflows, you use only what you need without architectural lock-in. Arvo's design philosophy embraces gradual adoption - **start simple and evolve naturally** as your requirements grow.

### Built-in Reliability

Reliability isn't an afterthought in Arvo - it's **engineered into the foundation**. Every service interaction is validated against explicit contracts, traced through distributed OpenTelemetry, and made replayable through event sourcing. The **contract-first approach** eliminates entire classes of integration failures while providing comprehensive observability from day one. When issues arise, you have complete visibility into event flows and the ability to replay scenarios for debugging.

### Evolutionary Architecture

Event-driven systems are notoriously difficult to evolve due to service decoupling trade-offs. Arvo treats **system evolution as a fundamental requirement** by addressing the **core issue: integration**. Through semantic versioning in contracts and version-sensitive primitives, Arvo provides comprehensive semantics that make system evolution a core tenant of event-driven architecture. This delivers clear evolution paths that enable system changes with confidence and peace of mind.


## Safe Scaling

Safe scaling in Arvo means two things:

### Infrastructure Flexibility

Your business logic remains unchanged whether you're running on a single machine or distributed across multiple data centers. Arvo's event-driven architecture scales horizontally by design, while vertical scaling comes naturally. More importantly, **you can transition between scaling strategies** without rewriting your application - start vertical, go horizontal, then back to vertical if needed. The **choice is yours, and it's reversible**.

### Feature Reliability

Adding new capabilities or modifying existing ones never breaks your system when you follow Arvo's contract-first development paradigm. From day one, you have comprehensive guarantees about service interactions. Features can be safely deployed, rolled back, or evolved because the contract system enforces compatibility rules that are both clear and comprehensive. This means you can innovate rapidly while maintaining system stability.


## Beyond Message Brokers and Workflow Engines

> Arvo must not be confused as a message broker or a workflow engine as is that case with current EDA eco-system.

Arvo transcends typical message brokers and workflow engines by providing an intelligent application layer that operates above message brokering infrastructure. It offers tools and primitives for building event-driven systems agnostic of the underlying messaging technology. As long as a message broker can perform string matching between event destinations and handler sources, an Arvo application can run on it. For development and testing, even a well-implemented in-memory NodeJS array can serve as an event broker.

This infrastructure independence eliminates vendor lock-in. Your business logic remains portable across deployment environments, from local development using in-memory brokers to production deployments using enterprise message queues like RabbitMQ, Apache Kafka, or cloud-native solutions.

## Start Simple, Scale Naturally

Getting started with Arvo requires no complicated infrastructure upfront. Begin with a simple console application, an HTTP web server built on Express.js or Hono, or interactive CLI tools using [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts). Write your business logic with Arvo patterns and execute event-driven flows locally. When it's time to migrate, scale services, or distribute business logic, you don't rewrite the core application—you simply update the execution environment.

This deployment flexibility allows the same business logic to run in-memory at small scale for development and testing, then seamlessly transition to distributed message brokers for production scale, all without significant changes to your core application logic. Your investment in business logic implementation is preserved throughout the entire scaling journey.

## Primitives over Prescription 

Arvo maintains minimal opinions, giving you maximum freedom to implement your architectural vision. Rather than forcing rigid patterns, it provides foundational, orthogonal primitives that compose naturally to build complex, intelligent, and ever-evolving applications according to your specific requirements. The business logic enabled by Arvo comes packed with enterprise grade capabilies out-of-the-box, and scales in both capability and infrastructure as demand grows, ensuring your architecture remains sustainable from prototype to enterprise scale.


## Comprehensive EDA Foundation

Arvo addresses critical event-driven architecture design bottlenecks that typically require complex custom solutions:

#### Event Structure

The heart of an event-driven system is inter-service communication, and the event is the foundational data structure upon which everything else depends. At the core of Arvo is an open standard based custom, self-describing JSON event structure that extends the [CloudEvent](https://cloudevents.io) specification. Arvo calls this event an `ArvoEvent`.

This sophisticated data structure carries not only the business payload but also comprehensive metadata for system operation: data integrity validation through schema references, intelligent routing information for next-hop delivery, security and access control information, distributed telemetry headers for end-to-end tracing, as well as deduplication, causation, and process correlation identifiers that link related events across complex workflows.

This standardization of event structure across all services eliminates the fragmentation that typically plagues event-driven systems where different teams create incompatible event formats. Every event speaks the same structural language while carrying domain-specific business data, creating a unified communication protocol that scales from simple service interactions to complex multi-service orchestrations.

**Trade-offs**
While `ArvoEvent` is extremely valueable within the Arvo eco-system it loses its gerneal purposeness outside Arvo system which the event can be parsed by other information has not use.

- **Event & System Governance** - Contract-first development with schema validation and evolution management
- **System Evolution** - Semantic versioning and backward compatibility for service interfaces  
- **Orchestration** - Multiple patterns from simple handlers to complex state machine workflows
- **State Persistence** - Pluggable memory interfaces supporting various distributed storage strategies
- **Event Routing** - Sophisticated domain-based routing with multi-context event broadcasting
- **Error Domains & Handling** - Layered error handling distinguishing business logic from infrastructure failures
- **Distributed Observability** - Native OpenTelemetry integration with comprehensive tracing and monitoring
- **Agent Architecture** - Support for autonomous agents with perception, memory, and action capabilities
