import { cleanString } from '../../../../../utils';

export const topicsMap = {
  exectionManager: cleanString(`
    ## The Execution Manager
    
    Manages the start-stop-resume lifecycle that enables agents to suspend execution
    while waiting for event-based asynchronous operations and resume exactly where 
    they left off when resulting events arrive. When an agent requests tools that 
    require external coordination, the execution manager persists the current state 
    and halts processing. Upon receiving result events, it reconstructs the 
    exact execution context and continues the reasoning loop seamlessly. 
    This mechanism allows agents to participate in long-running workflows without consuming 
    resources while idle.
  `),
  stateManager: cleanString(`
    ## State Management
    
    Handles conversation history, tool call tracking, and execution context persistence across 
    suspend-resume cycles, ensuring agents maintain coherent state through distributed operations. 
    The state manager serializes the complete agent context including messages, pending tool 
    calls, permission status, and token usage to your configured memory backend. When the 
    agent resumes, it deserializes this state and provides the exact conversation history to 
    the LLM as if no interruption occurred.
  `),
  actionsRegistry: cleanString(`
    ## Actions Registry
    
    Catalogs available tools across all modalities (internal functions, MCP 
    resources, event fabric services) and provides the LLM with their definitions during 
    context building. The registry maintains metadata including tool names, descriptions, 
    input schemas, and execution strategies for each available capability. During 
    agent initialization, it generates the complete tool catalog that gets injected 
    into the LLM's context, enabling the model to understand what actions it can take. 
    The registry also supports dynamic tool discovery from MCP servers at runtime.
  `),
  contextManager: cleanString(`
    ## Context Manager
    
    Constructs and maintains the conversation history and system prompts that frame the LLM's 
    reasoning, transforming raw events into meaningful agent context. The context manager 
    executes your custom context builder function to convert initialization events 
    into structured message histories and system prompts. It handles message lifecycle 
    tracking, including how many times the LLM has seen each message, and applies optimizations 
    like media masking to reduce token usage. The manager ensures the LLM receives the right 
    framing for each reasoning cycle.
  `),
  llmIntegration: cleanString(`
    ## LLM Integration
    
    Provides the intelligence layer where the language model interprets situations, reasons 
    about actions, and decides which tools to invoke without concerning itself with execution 
    mechanics. The integration abstracts provider-specific APIs (OpenAI, Anthropic, etc.) into 
    a uniform interface that handles message formatting, streaming, and response parsing. It supports 
    both text and structured JSON output modes, manages token counting, and provides error handling 
    for model-specific failures. The LLM focuses purely on cognitive work while the integration 
    handles all communication details.
  `),
  streaming: cleanString(`
    ## Streaming Manager
    
    Enables real-time observation of agent reasoning by emitting structured events as the 
    LLM generates text deltas, prepares tool calls, and progresses through decision cycles. 
    The streaming manager captures incremental updates from the LLM provider and transforms 
    them into standardized agent events with full context including subject, version, and token 
    usage. This allows external systems to build real-time UIs, perform live logging, or 
    monitor agent behavior as it happens. All streaming events include OpenTelemetry headers for 
    distributed trace correlation.
  `),
  feedbackManager: cleanString(`
    ## Feedback Manager

    Enables agent self-correction by capturing validation errors and presenting them to the 
    LLM for retry. When the agent produces invalid output or requests tools with malformed 
    arguments, the feedback manager intercepts these errors before they propagate. Instead 
    of failing the execution, it appends detailed error messages to the conversation history 
    as user feedback. The LLM sees its mistake in context and generates a corrected response, 
    creating an automatic healing loop that improves output quality and tool call accuracy 
    through iteration.    
  `),
  actionInteractionManager: cleanString(`
    ## Action Interaction Manager
    
    Tracks and enforces tool interaction quotas to prevent infinite reasoning loops, 
    injecting termination prompts when agents exhaust their allowed tool call budget. 
    The manager maintains a counter of tool execution cycles and compares it against 
    the configured maximum. When the quota is nearly exhausted, it injects additional
    context into the system prompt and message history instructing the LLM to provide 
    a final answer. If the hard limit is reached, the manager throws an error to prevent
    runaway execution.
  `),
  priorityManager: cleanString(`
    ## Priority Manager
    
    Sorts tool calls by configured priority and executes only the highest priority 
    batch, enabling patterns like human approval before sensitive operations. When 
    the LLM requests multiple tools simultaneously, the priority manager groups 
    them by their assigned priority values and identifies the highest priority set. 
    Only tools in this highest priority group proceed to execution while all 
    lower priority requests are silently dropped. This enforces deterministic sequencing for 
    critical workflows like approval-first or verification-first patterns.
  `),
  permissionsManager: cleanString(`
    ## Permissions Manager
    
    Enforces deterministic authorization policies outside LLM control, blocking unauthorized tools
    and triggering permission request workflows immune to prompt injection. Before executing any 
    tool marked as requiring permission, the manager checks current authorization state via the 
    configured permission manager implementation. Blocked tools receive error feedback while permission 
    request events are emitted to external authorizers. Once authorization responses arrive, 
    the agent retries previously blocked operations with updated permissions.
  `),
  localToolsExecutor: cleanString(`
    ## Local Tools Executor
    
    Executes internal synchronous functions immediately within the agent loop, handling lightweight 
    computation and bespoke tasks without leaving the process. The executor validates tool inputs 
    against their Zod schemas, invokes the tool function with proper OpenTelemetry instrumentation, 
    and captures results or errors. Execution happens synchronously in the same tick as the LLM 
    request, with results immediately appended to the conversation history. This enables fast operations 
    like calculations, data transformations, or self-talk notes without coordination overhead.
  `),
  mcpClientIntegration: cleanString(`
    ## MCP Client Integration
    
    Connects to Model Context Protocol servers for standardized access to external resources like 
    filesystems, databases, and APIs through a uniform interface. The integration manages the lifecycle 
    of MCP connections, discovers available tools during agent initialization, and routes tool 
    requests to the appropriate MCP server. It handles transport selection (SSE vs HTTP), error 
    recovery, and result marshaling back into the agent's message format. MCP tools execute synchronously from the agent's perspective despite potentially accessing remote resources.
  `),
  eventEmissionManager: cleanString(`
    ## Event Emissions Manager
    
    Handles event-driven tool execution by emitting events to the fabric and suspending 
    agent execution until service responses arrive, enabling distributed coordination. When 
    the LLM requests a tool backed by an event fabric service, the emission manager constructs 
    properly formatted events with deduplication IDs, routing domains, and parent subject 
    tracking. The agent immediately suspends after emission, persisting its state to memory. 
    Upon receiving service response events, the agent resumes and continues reasoning with the 
    tool results.
  `),
  eventValidation: cleanString(`
    ## Input Event Validation
    
    Validates incoming events against contract schemas, ensuring agents receive well-formed, 
    type-safe data before processing begins. The validator checks event structure, data payload 
    conformance to the accept schema, and version compatibility with available handlers. 
    Invalid events are rejected with detailed error messages before reaching agent logic. This 
    contract enforcement provides compile-time safety through TypeScript and runtime safety 
    through schema validation.
  `),
  versionManagement: cleanString(`
    ## Version Management
    
    Routes events to appropriate handler implementations based on contract versions, enabling 
    multiple agent versions to run simultaneously without breaking existing consumers. The 
    version manager extracts version information from incoming events, matches it against available 
    handler implementations, and invokes the correct context builder, LLM integration, and output 
    validator. Different versions can use different models, prompts, response formats, and 
    tool configurations while serving the same agent interface.
  `),
  eventEmissionAndValidation: cleanString(`
    ## Event Emission and Validation
    
    Validates and emits output events conforming to contract schemas, ensuring agents produce 
    correctly structured responses that downstream handlers can trust. Before emitting completion 
    events, the validator checks output data against the contract's emit schema for the agent's 
    version. Successfully validated outputs are wrapped in properly formatted events with 
    correlation IDs, execution units, and trace headers. Invalid outputs trigger the 
    feedback manager's self-correction loop rather than emitting malformed events.
  `),
  errorBoundaryManager: cleanString(`
    ## Error Boundary Management

    Captures and handles exceptions during agent execution, distinguishing between 
    operational errors and critical violations. The error boundary wraps all agent operations 
    including LLM calls, tool executions, and state persistence. Operational errors are 
    transformed into system error events that conform to the agent's contract, including proper 
    subject correlation and trace context. These events propagate through the event fabric, 
    allowing workflows and orchestrators to recognize failures and decide how to respond. Critical 
    violations from malformed configuration, state manager corruption, or locking failures throw
    exceptions that bubble up, enabling custom recovery logic, or retry mechanisms to intervene 
    when the agent's operational integrity is compromised.
  `),
  otelManager: cleanString(`
    ## OTEL Management
    
    Instruments agent execution with OpenTelemetry traces using OpenInference semantic conventions, 
    providing deep visibility into LLM calls, tool executions, and decision flows. The OTEL manager 
    creates hierarchical spans for each operation including agent loops, LLM invocations, tool executions,
    and permission checks. It populates spans with semantic attributes like model names, token counts, 
    tool parameters, and error details following OpenInference standards. Trace headers propagate through 
    all emitted events, enabling distributed trace correlation across the entire system.
  `),
} as const;
