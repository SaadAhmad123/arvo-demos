export const ExecutionDiagram = `
sequenceDiagram
    participant Client
    participant ArvoEventHandler
    participant ArvoOpenTelemetry
    participant Span
    participant VersionedContract
    participant HandlerFunction
    participant createArvoEventFactory
    participant resolveEventDomain
    participant createSystemErrorEvents

    Client->>ArvoEventHandler: execute(event, opentelemetry?)
    
    Note over ArvoEventHandler: Create OTel config
    ArvoEventHandler->>ArvoEventHandler: createEventHandlerTelemetryConfig(spanName, spanOptions, opentelemetry, event)
    ArvoEventHandler->>ArvoOpenTelemetry: getInstance().startActiveSpan(config)
    ArvoOpenTelemetry->>Span: create span
    Span-->>ArvoEventHandler: span
    
    ArvoEventHandler->>ArvoEventHandler: currentOpenTelemetryHeaders()
    ArvoEventHandler-->>ArvoEventHandler: otelSpanHeaders
    
    rect rgb(200, 220, 240)
        Note over ArvoEventHandler,Span: Initialization & Attribute Setting
        ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'normal')
        ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.type', 'handler')
        ArvoEventHandler->>Span: setStatus(OK)
        
        loop For each event otelAttribute
            ArvoEventHandler->>Span: setAttribute(\`consumable.0.\${key}\`, value)
        end
    end
    
    rect rgb(240, 220, 200)
        Note over ArvoEventHandler: Event Type Validation Phase
        
        alt contract.type ≠ event.type
            ArvoEventHandler-->>ArvoEventHandler: throw ConfigViolation('Event type mismatch...')
            ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            ArvoEventHandler->>Span: exceptionToSpan(error)
            ArvoEventHandler->>Span: setStatus(ERROR)
            ArvoEventHandler->>Span: end()
            ArvoEventHandler-->>Client: throw ConfigViolation
        end
        
        ArvoEventHandler->>Span: logToSpan(INFO, 'Event type validated against contract...')
    end
    
    rect rgb(220, 240, 220)
        Note over ArvoEventHandler: Dataschema & URI Validation Phase
        
        ArvoEventHandler->>ArvoEventHandler: EventDataschemaUtil.parse(event)
        ArvoEventHandler-->>ArvoEventHandler: parsedDataSchema
        
        alt parsedDataSchema?.uri exists && uri ≠ contract.uri
            ArvoEventHandler-->>ArvoEventHandler: throw ContractViolation('Contract URI mismatch...')
            ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            ArvoEventHandler->>Span: exceptionToSpan(error)
            ArvoEventHandler->>Span: setStatus(ERROR)
            ArvoEventHandler->>Span: end()
            ArvoEventHandler-->>Client: throw ContractViolation
        end
        
        alt parsedDataSchema?.version is null/undefined
            ArvoEventHandler->>Span: logToSpan(WARNING, 'Version resolution failed, defaulting to latest...')
        end
    end
    
    rect rgb(240, 240, 200)
        Note over ArvoEventHandler,VersionedContract: Contract Version Resolution Phase
        
        ArvoEventHandler->>ArvoEventHandler: contract.version(parsedDataSchema?.version ?? 'latest')
        
        alt Version resolution fails
            ArvoEventHandler-->>ArvoEventHandler: throw ConfigViolation('Invalid contract version...')
            ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            ArvoEventHandler->>Span: exceptionToSpan(error)
            ArvoEventHandler->>Span: setStatus(ERROR)
            ArvoEventHandler->>Span: end()
            ArvoEventHandler-->>Client: throw ConfigViolation
        end
        
        ArvoEventHandler-->>ArvoEventHandler: handlerContract
        ArvoEventHandler->>Span: logToSpan(INFO, 'Processing event with contract version...')
    end
    
    rect rgb(220, 220, 240)
        Note over ArvoEventHandler: Input Event Validation Phase
        
        ArvoEventHandler->>VersionedContract: handlerContract.accepts.schema.safeParse(event.data)
        VersionedContract-->>ArvoEventHandler: inputEventValidation
        
        alt inputEventValidation.error exists
            ArvoEventHandler-->>ArvoEventHandler: throw ContractViolation('Input event payload validation failed...')
            ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            ArvoEventHandler->>Span: exceptionToSpan(error)
            ArvoEventHandler->>Span: setStatus(ERROR)
            ArvoEventHandler->>Span: end()
            ArvoEventHandler-->>Client: throw ContractViolation
        end
        
        ArvoEventHandler->>Span: logToSpan(INFO, 'Event payload validated successfully...')
    end
    
    rect rgb(200, 240, 240)
        Note over ArvoEventHandler,HandlerFunction: Handler Execution Phase
        
        ArvoEventHandler->>Span: logToSpan(INFO, 'Executing handler for event type...')
        
        ArvoEventHandler->>HandlerFunction: handler[handlerContract.version]({event, source, contract, domain, span, spanHeaders})
        Note over HandlerFunction: Handler parameters:<br/>- event: event.toJSON()<br/>- source: this.source<br/>- contract: handlerContract<br/>- domain: {self, event}<br/>- span: OpenTelemetry span<br/>- spanHeaders: otelSpanHeaders
        
        HandlerFunction->>HandlerFunction: Execute user-defined logic
        
        alt Handler throws error
            HandlerFunction-->>ArvoEventHandler: throw Error
            ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
            ArvoEventHandler->>Span: exceptionToSpan(error)
            ArvoEventHandler->>Span: setStatus(ERROR)
            
            alt Error is ViolationError
                ArvoEventHandler->>Span: end()
                ArvoEventHandler-->>Client: throw ViolationError
            else Error is non-violation
                ArvoEventHandler->>createSystemErrorEvents: createSystemErrorEvents({error, event, otelHeaders, ...})
                
                Note over createSystemErrorEvents: Parameters:<br/>- orchestrationParentSubject: null<br/>- initEventId: event.id<br/>- selfContract: contract.version('any')<br/>- handlerType: 'handler'
                
                createSystemErrorEvents->>createSystemErrorEvents: Parse orchestration subject (if applicable)
                
                loop For each domain in systemErrorDomain
                    createSystemErrorEvents->>createSystemErrorEvents: resolveEventDomain(...)
                    createSystemErrorEvents->>createSystemErrorEvents: createArvoEventFactory(selfContract).systemError({...})
                    Note over createSystemErrorEvents: Error event properties:<br/>- source: this.source<br/>- subject: event.subject<br/>- to: event.source<br/>- error: error object<br/>- traceparent/tracestate<br/>- domain: resolved domain
                end
                
                createSystemErrorEvents-->>ArvoEventHandler: errorEvents[]
                
                loop For each errorEvent
                    loop For each otelAttribute
                        ArvoEventHandler->>Span: setAttribute(\`emittables.\${idx}.\${key}\`, value)
                    end
                end
                
                ArvoEventHandler->>Span: logToSpan(INFO, 'Execution completed with issues...')
                ArvoEventHandler->>Span: end()
                ArvoEventHandler-->>Client: { events: errorEvents }
            end
        end
        
        HandlerFunction-->>ArvoEventHandler: _handleOutput
        Note over HandlerFunction: Returns:<br/>- Single output object, or<br/>- Array of output objects, or<br/>- null/undefined
        
        alt _handleOutput is null/undefined
            ArvoEventHandler->>Span: end()
            ArvoEventHandler-->>Client: { events: [] }
        end
        
        ArvoEventHandler->>ArvoEventHandler: Normalize to array
        alt _handleOutput is Array
            ArvoEventHandler->>ArvoEventHandler: outputs = _handleOutput
        else _handleOutput is single object
            ArvoEventHandler->>ArvoEventHandler: outputs = [_handleOutput]
        end
    end
    
    rect rgb(240, 200, 240)
        Note over ArvoEventHandler,createArvoEventFactory: Event Creation & Broadcasting Phase
        
        ArvoEventHandler->>ArvoEventHandler: result = []
        
        loop For each output in outputs
            ArvoEventHandler->>ArvoEventHandler: Extract { __extensions, ...handlerResult }
            
            ArvoEventHandler->>ArvoEventHandler: domains = handlerResult.domain ?? [null]
            
            loop For each domain in domains
                ArvoEventHandler->>resolveEventDomain: resolveEventDomain({domainToResolve, handlerSelfContract, eventContract, triggeringEvent})
                Note over resolveEventDomain: Resolves domain based on:<br/>- Explicit domain value<br/>- Handler's self contract domain<br/>- Event contract domain<br/>- Triggering event domain
                resolveEventDomain-->>ArvoEventHandler: resolved domain
                
                ArvoEventHandler->>ArvoEventHandler: Remove duplicates via Set
            end
            
            loop For each unique resolved domain
                ArvoEventHandler->>createArvoEventFactory: createArvoEventFactory(handlerContract)
                createArvoEventFactory-->>ArvoEventHandler: eventFactory
                
                ArvoEventHandler->>eventFactory: emits({...handlerResult, ...metadata}, __extensions)
                Note over eventFactory: Event properties:<br/>- traceparent/tracestate: from otelSpanHeaders<br/>- source: this.source<br/>- subject: event.subject<br/>- to: handlerResult.to ?? event.redirectto ?? event.source<br/>- executionunits: handlerResult.executionunits ?? this.executionunits<br/>- accesscontrol: handlerResult.accesscontrol ?? event.accesscontrol<br/>- parentid: event.id<br/>- domain: resolved domain<br/>- __extensions: custom extensions
                
                alt Event creation fails (schema validation)
                    eventFactory-->>ArvoEventHandler: throw Error
                    ArvoEventHandler-->>ArvoEventHandler: throw ContractViolation('Invalid data')
                    ArvoEventHandler->>Span: setAttribute('arvo.handler.execution.status', 'failure')
                    ArvoEventHandler->>Span: exceptionToSpan(error)
                    ArvoEventHandler->>Span: setStatus(ERROR)
                    ArvoEventHandler->>Span: end()
                    ArvoEventHandler-->>Client: throw ContractViolation
                end
                
                eventFactory-->>ArvoEventHandler: createdEvent
                ArvoEventHandler->>ArvoEventHandler: result.push(createdEvent)
                
                loop For each otelAttribute in created event
                    ArvoEventHandler->>Span: setAttribute(\`emittables.\${result.length-1}.\${key}\`, value)
                end
            end
        end
    end
    
    rect rgb(200, 240, 200)
        Note over ArvoEventHandler: Success Response Phase
        ArvoEventHandler->>Span: logToSpan(INFO, 'Execution completed with issues and emitted N events')
        ArvoEventHandler->>Span: end()
        ArvoEventHandler-->>Client: { events: result }
    end
`;
