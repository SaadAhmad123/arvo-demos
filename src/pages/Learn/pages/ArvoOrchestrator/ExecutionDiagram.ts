export const ExecutionDiagram = `
sequenceDiagram
    participant Client
    participant ArvoOrchestrator
    participant executeWithOrchestrationWrapper
    participant ArvoOpenTelemetry
    participant Span
    participant validateAndParseSubject
    participant acquireLockWithValidation
    participant SyncEventResource
    participant MachineRegistry
    participant MachineExecutionEngine
    participant processRawEventsIntoEmittables
    participant createEmittableEvent
    participant handleOrchestrationErrors
    participant createSystemErrorEvents

    Client->>ArvoOrchestrator: execute(event, opentelemetry?)
    ArvoOrchestrator->>executeWithOrchestrationWrapper: executeWithOrchestrationWrapper(context, coreExecutionFn)
    
    Note over executeWithOrchestrationWrapper: Create OTel config
    executeWithOrchestrationWrapper->>ArvoOpenTelemetry: getInstance().startActiveSpan(config)
    ArvoOpenTelemetry->>Span: create span
    Span-->>executeWithOrchestrationWrapper: span
    
    Note over Span: Set initial span attributes
    executeWithOrchestrationWrapper->>Span: setStatus(OK)
    executeWithOrchestrationWrapper->>Span: setAttribute('arvo.handler.execution.type', 'orchestrator')
    executeWithOrchestrationWrapper->>Span: setAttribute('arvo.handler.execution.status', 'normal')
    executeWithOrchestrationWrapper->>Span: Set consumable event attributes
    executeWithOrchestrationWrapper->>Span: logToSpan('Starting execution...')
    
    executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: currentOpenTelemetryHeaders()
    executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: otelHeaders
    
    rect rgb(200, 220, 240)
        Note over executeWithOrchestrationWrapper,validateAndParseSubject: Subject Validation Phase
        executeWithOrchestrationWrapper->>validateAndParseSubject: validateAndParseSubject(event, source, syncEventResource, span, 'orchestrator')
        validateAndParseSubject->>SyncEventResource: validateEventSubject(event, span)
        SyncEventResource-->>validateAndParseSubject: validation result
        validateAndParseSubject->>validateAndParseSubject: ArvoOrchestrationSubject.parse(event.subject)
        validateAndParseSubject->>Span: setAttributes(parsed subject data)
        
        alt Subject orchestrator.name ≠ expectedSource
            validateAndParseSubject->>Span: logToSpan(WARNING, 'Event subject mismatch...')
            validateAndParseSubject-->>executeWithOrchestrationWrapper: null
            executeWithOrchestrationWrapper->>Span: logToSpan('Execution completed with issues...')
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: { events: [] }
            ArvoOrchestrator-->>Client: { events: [] }
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
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: throw TransactionViolation
            ArvoOrchestrator-->>Client: throw TransactionViolation
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
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: { events: [] }
            ArvoOrchestrator-->>Client: { events: [] }
        end
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: orchestrationParentSubject = state?.parentSubject ?? null
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: initEventId = state?.initEventId ?? null
        
        alt state === null (New orchestration)
            executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Initializing new execution state...')
            
            alt event.type ≠ source
                executeWithOrchestrationWrapper->>Span: logToSpan(WARNING, 'Invalid initialization event...')
                executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
                executeWithOrchestrationWrapper->>Span: end()
                executeWithOrchestrationWrapper-->>ArvoOrchestrator: { events: [] }
                ArvoOrchestrator-->>Client: { events: [] }
            end
        else state exists
            executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resuming execution with existing state...')
        end
        
        alt event.type === source
            executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: orchestrationParentSubject = event.data.parentSubject$$ ?? null
        end
    end
    
    rect rgb(240, 240, 200)
        Note over executeWithOrchestrationWrapper,MachineRegistry: Core Execution (coreExecutionFn)
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Resolving machine...')
        executeWithOrchestrationWrapper->>MachineRegistry: resolve(event, {inheritFrom: 'CONTEXT'})
        MachineRegistry-->>executeWithOrchestrationWrapper: machine | null
        
        alt machine === null
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Machine resolution failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            Note over handleOrchestrationErrors: Error is violation - throw
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: throw ConfigViolation
            ArvoOrchestrator-->>Client: throw ConfigViolation
        end
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Input validation started...')
        executeWithOrchestrationWrapper->>MachineRegistry: machine.validateInput(event, span)
        MachineRegistry-->>executeWithOrchestrationWrapper: inputValidation result
        
        alt inputValidation.type === 'CONTRACT_UNRESOLVED'
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ConfigViolation('Contract validation failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: throw ConfigViolation
            ArvoOrchestrator-->>Client: throw ConfigViolation
        else inputValidation.type === 'INVALID_DATA' || 'INVALID'
            executeWithOrchestrationWrapper-->>executeWithOrchestrationWrapper: throw ContractViolation('Input validation failed...')
            executeWithOrchestrationWrapper->>handleOrchestrationErrors: Handle error
            handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: error, events: null }
            executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
            executeWithOrchestrationWrapper->>Span: end()
            executeWithOrchestrationWrapper-->>ArvoOrchestrator: throw ContractViolation
            ArvoOrchestrator-->>Client: throw ContractViolation
        end
        
        executeWithOrchestrationWrapper->>MachineExecutionEngine: execute({state: state?.state ?? null, event, machine}, {inheritFrom: 'CONTEXT'})
        MachineExecutionEngine-->>executeWithOrchestrationWrapper: executionResult
        
        executeWithOrchestrationWrapper->>Span: setAttribute('arvo.orchestration.status', executionResult.state.status)
        
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: rawMachineEmittedEvents = executionResult.events
        
        alt executionResult.finalOutput exists
            executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Push complete event to rawMachineEmittedEvents
            Note over executeWithOrchestrationWrapper: type: completeEventType<br/>to: redirectto ?? initiator<br/>domain: parent domain or [null]
        end
    end
    
    rect rgb(220, 220, 240)
        Note over executeWithOrchestrationWrapper,processRawEventsIntoEmittables: Event Processing Phase
        executeWithOrchestrationWrapper->>processRawEventsIntoEmittables: processRawEventsIntoEmittables(params, span)
        
        loop For each rawEvent in rawMachineEmittedEvents
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
                                
                                loop For each domain in systemErrorDomain
                                    createSystemErrorEvents->>createSystemErrorEvents: Create system error event
                                    createSystemErrorEvents->>createSystemErrorEvents: Route to initiator with parent subject
                                end
                                
                                createSystemErrorEvents-->>handleOrchestrationErrors: errorEvents[]
                                handleOrchestrationErrors->>Span: Add error event attributes
                                handleOrchestrationErrors-->>executeWithOrchestrationWrapper: { errorToThrow: null, events: errorEvents }
                                executeWithOrchestrationWrapper->>SyncEventResource: releaseLock(event, acquiredLock, span)
                                executeWithOrchestrationWrapper->>Span: end()
                                executeWithOrchestrationWrapper-->>ArvoOrchestrator: { events: errorEvents }
                                ArvoOrchestrator-->>Client: { events: errorEvents }
                            end
                        end
                        
                        alt event.data.parentSubject$$ exists
                            createEmittableEvent->>createEmittableEvent: subject = ArvoOrchestrationSubject.from({...})
                        else parentSubject$$ not provided
                            createEmittableEvent->>createEmittableEvent: subject = ArvoOrchestrationSubject.new({...})
                        end
                        
                        Note over createEmittableEvent: If subject creation fails,<br/>throw ExecutionViolation
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
                        executeWithOrchestrationWrapper-->>ArvoOrchestrator: throw ContractViolation
                        ArvoOrchestrator-->>Client: throw ContractViolation
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
        
        executeWithOrchestrationWrapper->>Span: logToSpan(INFO, 'Machine execution completed...')
    end
    
    rect rgb(200, 240, 240)
        Note over executeWithOrchestrationWrapper,SyncEventResource: State Persistence Phase
        executeWithOrchestrationWrapper->>executeWithOrchestrationWrapper: Build newState object
        Note over executeWithOrchestrationWrapper: newState = {<br/>  executionStatus: 'normal',<br/>  initEventId,<br/>  subject,<br/>  parentSubject,<br/>  status,<br/>  value,<br/>  state,<br/>  events: {consumed, produced},<br/>  machineDefinition<br/>}
        
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
    
    executeWithOrchestrationWrapper-->>ArvoOrchestrator: { events: emittables }
    ArvoOrchestrator-->>Client: { events: emittables }
`;
