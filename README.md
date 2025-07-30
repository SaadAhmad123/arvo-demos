# Arvo - A Toolkit for Service Choreography

Arvo is an enterprise-grade Node.js standard library for building reliable, evolutionary event-driven applications that scale from simple microservices to complex distributed workflows and agents.

#### Simplicity 

Arvo provides a focused set of composable primitives that work together regardless of complexity. Use what you need, when you need it, in the environment of your choice. Arvo doesn't constrain you to build applications exclusively with its patterns.

### Reliability 

First-class system reliability comes through contract-first development, comprehensive error handling, and built-in observability. Every service interaction is validated against explicit contracts, observed through distributed OpenTelemetry, and made replayable and auditable through event sourcing capabilities.

### Longevity

Services evolve independently while maintaining compatibility. Evolution isn't an afterthought but built into the architecture through semantic versioning of contracts, backward-compatible schema evolution, and clear upgrade paths. This evolution spans both infrastructure scale and capability growth as demands and requirements change.

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