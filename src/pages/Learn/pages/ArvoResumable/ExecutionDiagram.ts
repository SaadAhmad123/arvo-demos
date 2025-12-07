export const ExecutionDiagram = `
sequenceDiagram
    participant Client
    participant ArvoResumable
    participant executeWithOrchestrationWrapper
    participant ArvoOpenTelemetry
    participant Span
    participant validateAndParseSubject
    participant acquireLockWithValidation
    participant SyncEventResource
    participant validateInputEvent
    participant HandlerFunction
    participant processRawEventsIntoEmittables
    participant createEmittableEvent
    participant handleOrchestrationErrors
    participant createSystemErrorEvents

    Client->>ArvoResumable: execute(event, opentelemetry?)
    ArvoResumable->>executeWithOrchestrationWrapper: executeWithOrchestrationWrapper(context, coreExecutionFn)
    
    Note over executeWithOrchestrationWrapper: Create OTel config
    executeWithOrchestrationWrapper->>ArvoOpenTelemetry: getInstance().startActiveSpan(config)
    ArvoOpenTelemetry->>Span: create span
    Span-->>executeWithOrchestrationWrapper: span
    
    Note over Span: Set initial span attributes
    executeWithOrchestrationWrapper->>Span: setStatus(OK)
    executeWithOrchestrationWrapper->>Span: setAttribute('arvo.handler.execution.type', 'resumable')
    executeWithOrchestrationWrapper->>Span: setAttribute('arvo.handler.execution.status', 'normal')
    executeWithOrchestrationWrapper->>Span: Set consumable event attributes
    executeWithOrchestrationWrapper->>Span: logToSpan('Starting execution...')
    
    executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: currentOpenTelemetryHeaders()
    executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: otelHeaders
    
    rect rgb(200, 220, 240)
        Note over executeWithOrchestrationWrapper,validateAndParseSubject: Subject Validation Phase
        executeWithOrchestrationWrapper->>validateAndParseSubject: validateAndParseSubject(event, source, syncEventResource, span, 'resumable')
        validateAndParseSubject->>SyncEventResource: validateEventSubject(event, span)
        SyncEventResource-->>validateAndParseSubject: validation result
        validateAndParseSubject->>validateAndParseSubject: ArvoOrchestrationSubject.parse(event.subject)
        validateAndParseSubject->>Span: setAttributes(parsed subject data)
        
        alt Subject orchestrator.name ≠ expectedSource
            validateAndParseSubject->>Span: logToSpan(WARNING, 'Event subject mismatch...')
            validateAndParseSubject-->>executeWithOrchestrationWrapper: null
            executeWithOrchestrationWrapper->>Span: logToSpan('Execution completed with issues...')
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: { events: [] }
            ArvoResumable-->>Client: { events: [] }
        else Subject valid
            validateAndParseSubject-->>executeWithOrchestrationWrapper: parsedEventSubject
        end
    end
    
    rect rgb(240, 220, 200)
        Note over executeWithOrchestrationWrapper,acquireLockWithValidation: Lock Acquisition Phase
        executeWithOrchestrationWrapper->>acquireLockWithValidation: acquireLockWithValidation(syncEventResource, event, span)
        acquireLockWithValidation->>SyncEventResource: acquireLock(event, span)
        SyncEventResource-->>acquireLockWithValidation: acquiredLock status
        
        alt acquiredLock === 'NOT_ACQUIRED'
            acquireLockWithValidation-->>executeWithOrchestrationWrapper: throw TransactionViolation(LOCK_UNACQUIRED)
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            Note over handleOrchestrationErrors: Error is violation - throw
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw TransactionViolation
            ArvoResumable-->>Client: throw TransactionViolation
        else acquiredLock === 'ACQUIRED'
            acquireLockWithValidation->>Span: logToSpan(INFO, 'This execution acquired lock...')
            acquireLockWithValidation-->>executeWithOrchestrationWrapper: 'ACQUIRED'
        else acquiredLock === 'NOT_REQUIRED'
            acquireLockWithValidation-->>executeWithOrchestrationWrapper: 'NOT_REQUIRED'
        end
    end
    
    rect rgb(220, 240, 220)
        Note over executeWithOrchestrationWrapper,SyncEventResource: State Acquisition Phase
        executeWithOrchestrationWrapper->>SyncEventResource: acquireState(event, span)
        SyncEventResource-->>executeWithOrchestrationWrapper: state | null
        
        alt state?.executionStatus === 'failure'
            executeWithOrchestrationWrapper->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            executeWithOrchestrationWrapper->>Span: logToSpan(WARNING, 'Orchestration has failed...')
            executeWithOrchestrationWrapper->>Span: setStatus(ERROR)
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: { events: [] }
            ArvoResumable-->>Client: { events: [] }
        end
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: orchestrationParentSubject = state?.parentSubject ?? null
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: initEventId = state?.initEventId ?? null
        
        alt state === null (New workflow)
            executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Initializing new execution state...')
            
            alt event.type ≠ source
                executeWithOrchestrationWrapper->>Span: logToSpan(WARNING, 'Invalid initialization event...')
                executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
                executeWithOrchestrationWrapper->>Span: end()
                executeWithOrchestrationWrapper-->>ArvoResumable: { events: [] }
                ArvoResumable-->>Client: { events: [] }
            end
        else state exists
            executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resuming execution with existing state...')
        end
        
        alt event.type === source
            executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: orchestrationParentSubject = event.data.parentSubject$$ ?? null
        end
    end
    
    rect rgb(240, 240, 200)
        Note over executeWithOrchestrationWrapper,HandlerFunction: Core Execution (coreExecutionFn)
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resolving handler...')
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Check handler[parsedEventSubject.orchestrator.version]
        
        alt handler version not found
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Handler resolution failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            Note over handleOrchestrationErrors: Error is violation - throw
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ConfigViolation
            ArvoResumable-->>Client: throw ConfigViolation
        end
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Input validation started...')
        executeWithOrchestrationWrapper->>validateInputEvent: validateInputEvent({event, selfContract, serviceContracts, span})
        
        validateInputEvent->>validateInputEvent: Parse event dataschema
        
        alt Dataschema parsing fails
            validateInputEvent->>Span: logToSpan(WARNING, 'Event dataschema resolution failed...')
            validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'INVALID', error }
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Event dataschema resolution failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ConfigViolation
            ArvoResumable-->>Client: throw ConfigViolation
        end
        
        validateInputEvent->>validateInputEvent: Determine contract type (self vs service)
        
        alt event.type === selfContract.type
            validateInputEvent->>validateInputEvent: contractType = 'self'
            validateInputEvent->>validateInputEvent: resolvedContract = selfContract.version(parsedVersion)
        else event.type matches service contract
            validateInputEvent->>validateInputEvent: contractType = 'service'
            validateInputEvent->>validateInputEvent: Search through serviceContracts.emitList
            validateInputEvent->>validateInputEvent: resolvedContract = matching service contract
        end
        
        alt resolvedContract === null
            validateInputEvent->>Span: logToSpan(WARNING, 'Contract resolution failed...')
            validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'CONTRACT_UNRESOLVED' }
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Contract validation failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ConfigViolation
            ArvoResumable-->>Client: throw ConfigViolation
        end
        
        validateInputEvent->>Span: logToSpan(INFO, 'Dataschema resolved...')
        
        alt parsedDataschema.uri ≠ resolvedContract.uri
            validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'INVALID', error: 'Contract URI mismatch' }
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Contract URI mismatch...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ConfigViolation
            ArvoResumable-->>Client: throw ConfigViolation
        end
        
        alt version mismatch (not wildcard)
            validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'INVALID', error: 'Contract version mismatch' }
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Contract version mismatch...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ConfigViolation
            ArvoResumable-->>Client: throw ConfigViolation
        end
        
        validateInputEvent->>validateInputEvent: Select validation schema (self.accepts or service.emits[type])
        validateInputEvent->>validateInputEvent: validationSchema.safeParse(event.data)
        
        alt Validation fails
            validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'INVALID_DATA', error: ZodError }
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ContractViolation('Input validation failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: throw ContractViolation
            ArvoResumable-->>Client: throw ContractViolation
        end
        
        validateInputEvent-->>executeWithOrchestrationWrapper: { type: 'VALID', contractType }
        
        Note over executeWithOrchestrationWrapper: Check workflow completion status
        alt state?.status === 'done'
            executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resumable already in terminal state...')
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: { events: [] }
            ArvoResumable-->>Client: { events: [] }
        end
        
        Note over executeWithOrchestrationWrapper: Track expected events
        alt event.parentid exists && state?.events?.expected?.[event.parentid] exists
            executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: state.events.expected[event.parentid].push(event.toJSON())
        end
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Build eventTypeToExpectedEvent mapping
        Note over executeWithOrchestrationWrapper: Loop through state?.events?.expected<br/>Group events by type
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Get handler for version
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: versionedSelfContract = self.version(orchestrator.version)
        
        executeWithOrchestrationWrapper->>HandlerFunction: handler({span, context, metadata, collectedEvents, domain, input, service, contracts})
        Note over HandlerFunction: Handler parameters:<br/>- span: OpenTelemetry span<br/>- context: state$$ (custom state)<br/>- metadata: full state object<br/>- collectedEvents: event type mapping<br/>- domain: {event, self}<br/>- input: init event (if self type)<br/>- service: service event (if service type)<br/>- contracts: {self, services}
        
        HandlerFunction->>HandlerFunction: Execute user-defined logic
        
        alt Handler throws error
            HandlerFunction-->>executeWithOrchestrationWrapper: throw Error
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            Note over handleOrchestrationErrors: Non-violation error
            handleOrchestrationErrors->>SyncEventResource: persistState(failure state)
            handleOrchestrationErrors->>createSystemErrorEvents: createSystemErrorEvents(params)
            
            loop For each domain in systemErrorDomain
                createSystemErrorEvents->>createSystemErrorEvents: Parse orchestration subject
                createSystemErrorEvents->>createSystemErrorEvents: Create system error event
                createSystemErrorEvents->>createSystemErrorEvents: Route to initiator with parent subject
            end
            
            createSystemErrorEvents-->>handleOrchestrationErrors: errorEvents[]
            handleOrchestrationErrors->>Span: Add error event attributes
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: null, events: errorEvents }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoResumable: { events: errorEvents }
            ArvoResumable-->>Client: { events: errorEvents }
        end
        
        HandlerFunction-->>executeWithOrchestrationWrapper: executionResult
        Note over HandlerFunction: executionResult = {<br/>  context?: TMemory,<br/>  output?: CompleteOutput,<br/>  services?: RawEvent[]<br/>}
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: rawEvents = executionResult?.services ?? []
        
        alt executionResult?.output exists
            executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Push completion event to rawEvents
            Note over executeWithOrchestrationWrapper: type: completeEventType<br/>to: redirectto ?? initiator<br/>domain: parent domain or [null]
        end
    end
    
    rect rgb(220, 220, 240)
        Note over executeWithOrchestrationWrapper,processRawEventsIntoEmittables: Event Processing Phase
        executeWithOrchestrationWrapper->>processRawEventsIntoEmittables: processRawEventsIntoEmittables(params, span)
        
        loop For each rawEvent in rawEvents
            loop For each domain in event.domain ?? [null]
                processRawEventsIntoEmittables->>createEmittableEvent: createEmittableEvent(params, span)
                
                createEmittableEvent->>Span: logToSpan(INFO, 'Creating emittable event...')
                
                createEmittableEvent->>createEmittableEvent: Build serviceContractMap
                createEmittableEvent->>createEmittableEvent: Initialize schema, contract, subject, parentId, domain
                
                alt event.type === selfContract.completeEventType
                    createEmittableEvent->>Span: logToSpan(INFO, 'Creating event for workflow completion...')
                    createEmittableEvent->>createEmittableEvent: Set contract = selfContract
                    createEmittableEvent->>createEmittableEvent: Set schema = selfContract.emits[completeEventType]
                    createEmittableEvent->>createEmittableEvent: Set subject = orchestrationParentSubject ?? sourceEvent.subject
                    createEmittableEvent->>createEmittableEvent: Set parentId = initEventId
                    createEmittableEvent->>createEmittableEvent: Resolve domain
                else serviceContractMap[event.type] exists
                    createEmittableEvent->>Span: logToSpan(INFO, 'Creating service event...')
                    createEmittableEvent->>createEmittableEvent: Set contract = serviceContractMap[event.type]
                    createEmittableEvent->>createEmittableEvent: Set schema = contract.accepts.schema
                    createEmittableEvent->>createEmittableEvent: Resolve domain
                    
                    alt contract is ArvoOrchestratorContract
                        alt event.data.parentSubject$$ exists
                            createEmittableEvent->>createEmittableEvent: ArvoOrchestrationSubject.parse(parentSubject$$)
                            Note over createEmittableEvent: Validates parentSubject$$
                            
                            alt Parse fails
                                createEmittableEvent-->>processRawEventsIntoEmittables: throw ExecutionViolation('Invalid parentSubject$$...')
                                processRawEventsIntoEmittables-->>executeWithOrchestrationWrapper: throw error
                                executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
                                Note over handleOrchestrationErrors: Non-violation error
                                handleOrchestrationErrors->>SyncEventResource: persistState(failure state)
                                handleOrchestrationErrors->>createSystemErrorEvents: createSystemErrorEvents(params)
                                createSystemErrorEvents-->>handleOrchestrationErrors: errorEvents[]
                                handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: null, events: errorEvents }
                                executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
                                executeWithOrchestrationWrapper->>Span: end()
                                executeWithOrchestrationWrapper-->>ArvoResumable: { events: errorEvents }
                                ArvoResumable-->>Client: { events: errorEvents }
                            end
                        end
                        
                        alt event.data.parentSubject$$ exists
                            createEmittableEvent->>createEmittableEvent: subject = ArvoOrchestrationSubject.from({...})
                        else parentSubject$$ not provided
                            createEmittableEvent->>createEmittableEvent: subject = ArvoOrchestrationSubject.new({...})
                        end
                    end
                end
                
                createEmittableEvent->>createEmittableEvent: finalDataschema = event.dataschema
                createEmittableEvent->>createEmittableEvent: finalData = event.data
                
                alt contract and schema exist
                    createEmittableEvent->>createEmittableEvent: finalData = schema.parse(event.data)
                    
                    alt Parse fails
                        createEmittableEvent-->>processRawEventsIntoEmittables: throw ContractViolation('Invalid event data...')
                        processRawEventsIntoEmittables-->>executeWithOrchestrationWrapper: throw error
                        executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
                        Note over handleOrchestrationErrors: Error is violation - throw
                        handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
                        executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
                        executeWithOrchestrationWrapper->>Span: end()
                        executeWithOrchestrationWrapper-->>ArvoResumable: throw ContractViolation
                        ArvoResumable-->>Client: throw ContractViolation
                    end
                    
                    createEmittableEvent->>createEmittableEvent: finalDataschema = EventDataschemaUtil.create(contract)
                end
                
                createEmittableEvent->>createEmittableEvent: createArvoEvent({...all properties...})
                createEmittableEvent->>Span: logToSpan(INFO, 'Event created successfully...')
                createEmittableEvent-->>processRawEventsIntoEmittables: emittableEvent
                
                processRawEventsIntoEmittables->>processRawEventsIntoEmittables: Add to emittables array
                processRawEventsIntoEmittables->>Span: setAttribute(emittable attributes)
            end
        end
        
        processRawEventsIntoEmittables-->>executeWithOrchestrationWrapper: emittables[]
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resumable execution completed...')
    end
    
    rect rgb(200, 240, 240)
        Note over executeWithOrchestrationWrapper: State Persistence Phase
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Build eventTrackingState
        Note over executeWithOrchestrationWrapper: eventTrackingState = {<br/>  consumed: event.toJSON(),<br/>  expected: emittables.length ?<br/>    Object.fromEntries(emittables.map(item => [item.id, []]))<br/>    : state?.events?.expected ?? null,<br/>  produced: emittables.map(item => item.toJSON())<br/>}
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Build newState object
        Note over executeWithOrchestrationWrapper: newState = {<br/>  executionStatus: 'normal',<br/>  status: executionResult?.output ? 'done' : 'active',<br/>  initEventId,<br/>  parentSubject,<br/>  subject,<br/>  events: eventTrackingState,<br/>  state$$: executionResult?.context ?? state?.state$$ ?? null<br/>}
        
        loop For each emittable in emittables
            executeWithOrchestrationWrapper->>Span: setAttribute(emittable otel attributes)
        end
        
        executeWithOrchestrationWrapper->>SyncEventResource: persistState(event, newState, state, span)
        SyncEventResource-->>executeWithOrchestrationWrapper: success
        
        alt Persist fails
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw (caught by try/catch)
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            Note over handleOrchestrationErrors: Process as appropriate
            handleOrchestrationErrors->>SyncEventResource: releaseLock(event, acquiredLock, span)
            handleOrchestrationErrors->>Span: end()
            Note over handleOrchestrationErrors: Return error or throw
        end
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'State update persisted...')
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Execution successfully completed...')
    end
    
    rect rgb(240, 200, 240)
        Note over executeWithOrchestrationWrapper,SyncEventResource: Cleanup Phase
        executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
        SyncEventResource-->>executeWithOrchestrationWrapper: lock released
        executeWithOrchestrationWrapper->>Span: end()
    end
    
    executeWithOrchestrationWrapper-->>ArvoResumable: { events: emittables }
    ArvoResumable-->>Client: { events: emittables }
`.trim();
