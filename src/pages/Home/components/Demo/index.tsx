import React from 'react';
import { Md3ContentPadding } from '../../../../classNames';
import { ContentContainer } from '../../../../components/ContentContainer';
import { DemoView } from '../../../../components/DemoView';
import { ReMark } from '../../../../components/ReMark';
import { cleanString } from '../../../../utils';
import { AdditionHandlerTab } from './CodeTabs/AdditionHandler';
import { ExecuteTab } from './CodeTabs/ExecuteTab';
import { OrchestratorTab } from './CodeTabs/Orchestrator';
import { ResumableTab } from './CodeTabs/Resumable';
import { SecondSimpleHandlerTab } from './CodeTabs/SecondSimpleHandler';
import { SimpleHandlerExecutionTab } from './CodeTabs/SimpleHandlerExecution';
import { TwoHandlerBrokerTab } from './CodeTabs/TwoHandlerEventBroker';
import { TestOrchestratorTab } from './CodeTabs/TestOrchestrator';
import { ExecuteOrchestratorTab } from './CodeTabs/ExecuteOrchestrator';
import { TestResumableTab } from './CodeTabs/TestingResumable';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Building Your First Event-Driven Application  
              
              With your dependencies installed and project configured, you're ready to build your first 
              event-driven console application. This hands-on introduction demonstrates Arvo's core concepts 
              through a fully functional application that runs and tests locally without requiring any 
              cloud infrastructure or external message brokers.

              ## What You'll Build

              This tutorial guides you through progressively sophisticated event-driven patterns, starting 
              with fundamentals and advancing to orchestration strategies. Everything runs locally in your 
              development environment.

              - **Simple event handlers** - Create request-response handlers that process events and emit results, 
                starting with a handler that sums numbers
              - **Direct execution** - Learn how handlers execute as standalone functions during development and testing
              - **Multiple handlers** - Build a second handler that multiplies numbers, demonstrating how different handlers 
                coexist in a system
              - **Event broker coordination** - Use \`SimpleEventBroker\` to route events between handlers, establishing 
                the foundation for event-driven architecture
              - **Declarative workflows** - Compose handlers into multi-step workflows using state machines, introducing 
                memory backends for workflow state persistence
              - **Testing patterns** - Apply Arvo's testing suite for unit and integration tests validating handler behavior 
                and event-driven coordination
              - **Imperative orchestration** - Coordinate complex workflows through code-driven orchestrators that make 
                runtime decisions based on handler responses

              Each section builds on previous concepts, gradually introducing the patterns and tools you'll use to 
              construct production event-driven systems.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer>
        <DemoView
          panels={[
            AdditionHandlerTab,
            SimpleHandlerExecutionTab,
            SecondSimpleHandlerTab,
            TwoHandlerBrokerTab,
            OrchestratorTab,
            TestOrchestratorTab,
            ExecuteOrchestratorTab,
            ResumableTab,
            TestResumableTab,
            ExecuteTab,
          ]}
        />
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Nature of Orchestration in Arvo

              Orchestration in Arvo is designed to feel natural within the broader event-driven model. 
              Rather than relying on a centralized workflow engine, **orchestrators are simply specialized 
              event handlers** that manage state, emit events, and coordinate other handlers. This allows 
              orchestration logic to run anywhere your handlers run—locally, in serverless environments, or 
              across distributed clusters.

              ## Two Orchestration Styles

              Arvo provides two complementary approaches to workflow orchestration:

              **State-Machine Orchestrators** are declarative workflows built on XState, ideal for well-defined, 
              predictable processes that benefit from visualization and formal guarantees. They excel when your 
              workflow has clear states and transitions that can be mapped out in advance.

              **Resumable (Imperative) Orchestrators** offer step-by-step workflows written in familiar programming
              constructs, perfect for *agentic AI scenarios* or dynamic processes where the next step depends on runtime 
              inputs such as LLM responses, API calls, or human-in-the-loop actions. They provide the flexibility to 
              handle complex conditional logic without state explosion.

              ## Start-Stop Execution Model

              A defining characteristic of Arvo's execution model is its **start-stop nature**. Orchestrators do not run 
              as long-lived threads; instead, they process an incoming event, emit the next set of events, persist their
              state, and then pause. When responses or follow-up events arrive, the orchestrator resumes from where it left off.

              This execution model delivers three critical benefits:

              **Resource Efficiency** — No CPU or memory is consumed while waiting for responses. Thousands of workflows 
              can remain in flight without heavy infrastructure costs, as idle orchestrations consume zero resources.

              **Horizontal Scalability** — Since orchestrators are stateless between events, new instances can be spun up 
              on demand to handle load without coordination overhead. Each event can be processed by any available instance.

              **Resiliency** — If a process crashes mid-orchestration, another instance can pick up seamlessly using the 
              persisted state in \`IMachineMemory\`. Workflows survive failures without manual intervention or recovery 
              procedures.

              ## Unified Yet Flexible

              This dual approach—structured state machines combined with imperative resumables—paired with the start-stop 
              execution model means you can model both predictable workflows and adaptive AI-driven processes within the same
              system. All orchestrators use contracts for type-safety and observability, making them straightforward to evolve, 
              compose, and test without introducing central bottlenecks or architectural inconsistencies.
            
            `)}
          />
        </div>
      </ContentContainer>
    </>
  );
};
