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
              - **Human-in-the-loop integration** - Implement workflows that pause for human approval and external coordination 
                using domain-based event routing

              Each section builds on previous concepts, gradually introducing the patterns and tools you'll use to 
              construct production event-driven systems. The business logic throughout this tutorial is intentionally 
              simple. Building a calculator with orchestrators, state machines, and event-driven coordination is 
              architectural overkill for arithmetic operations. This simplicity is deliberate, keeping business 
              complexity minimal so you can focus entirely on understanding Arvo's patterns, orchestration approaches, 
              and testing strategies rather than wrestling with domain logic. By the end, you'll have built a calculator 
              system, but the real value is understanding the event-driven concepts that apply to any production application.
              **You'll understand how to compose handlers, coordinate workflows declaratively and imperatively, integrate 
              external systems, and test event-driven logic in Arvo.**
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
    </>
  );
};
