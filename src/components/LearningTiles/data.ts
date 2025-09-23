export type LearningTileData = {
  name: string;
  summary: string;
  link: string;
};

export const ArvoEventLearn: LearningTileData = {
  name: 'ArvoEvent',
  summary:
    'Self-describing event structure extending CloudEvents with enterprise-grade routing, observability, and validation capabilities for reliable distributed communication.',
  link: '/learn/arvo-event',
};

export const ArvoContractLearn: LearningTileData = {
  name: 'ArvoContract',
  summary:
    'TypeScript-Zod contract system enabling contract-first development with compile-time type safety, runtime validation, and semantic versioning support.',
  link: '/learn/arvo-contract',
};

export const ArvoEventFactoryLearn: LearningTileData = {
  name: 'ArvoEventFactory',
  summary:
    'Intelligent abstraction layer for creating contract-compliant ArvoEvents with automatic validation, OpenTelemetry integration, and streamlined event construction.',
  link: '/learn/arvo-event-factory',
};

export const ArvoEventHandlerLearn: LearningTileData = {
  name: 'ArvoEventHandler',
  summary:
    'Basic event handler implementing request-response patterns with contract enforcement, comprehensive error handling, and consistent execution signatures.',
  link: '/learn/arvo-event-handler',
};

export const ArvoMachineLearn: LearningTileData = {
  name: 'ArvoMachine',
  summary:
    'Declarative state machine builder using XState for defining complex workflows with contract binding, synchronous execution, and domain-aware event emission.',
  link: '/learn/arvo-machine',
};

export const ArvoOrchestratorLearn: LearningTileData = {
  name: 'ArvoOrchestrator',
  summary:
    'Specialized event handler providing robust execution environment for ArvoMachine with lifecycle management, telemetry integration, and distributed coordination.',
  link: '/learn/arvo-orchestrator',
};

export const ArvoResumableLearn: LearningTileData = {
  name: 'ArvoResumable',
  summary:
    'Imperative orchestration handler using familiar async/await patterns to manage distributed workflows with explicit control and simplified debugging.',
  link: '/learn/arvo-resumable',
};

export const ArvoEventDataFieldDeepDiveLearn = {
  name: 'ArvoEvent — Data Field Deep Dive',
  summary:
    'Deep dive into key data field or ArvoEvent to understand the internal working of event handler and distributed tracing.',
  link: '/advanced/arvo-event-data-field-deep-dive',
};

export const EventRoutingAndBrokerInArvoLearn = {
  name: 'Broker Design in Arvo',
  summary:
    'ArvoEvent, being the core unit of communication in Arvo, introduces a shift in thinking about event routing and brokering which leads to simpler and more scalable infrastructure.',
  link: '/advanced/event-routing-and-brokers',
};

export const AgenticResumableDesign = {
  name: 'Agentic AI Paradigm',
  summary:
    'See how ArvoResumables naturally unlock agentic ecosystems—where AIs, services, workflows, and humans collaborate seamlessly.',
  link: '/advanced/arvo-agentic-resumables',
};
