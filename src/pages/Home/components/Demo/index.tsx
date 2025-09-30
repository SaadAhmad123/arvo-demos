import React from 'react';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { Separator } from '../../../../components/Separator';
import { Md3ContentPadding } from '../../../../classNames';
import { GreetingOrchestratorTab } from './CodeTabs/GreetingOrchestrator';
import { Md3Cards } from '../../../../classNames/cards';
import { ReMark } from '../../../../components/ReMark';
import CodeBlock from '../../../../components/CodeBlock';
import { GreetingResumableTab } from './CodeTabs/GreetingResumable';
import { cleanString } from '../../../../utils';
import { AdditionHandlerTab } from './CodeTabs/AdditionHandler';
import { SimpleHandlerExecutionTab } from './CodeTabs/SimpleHandlerExecution';
import { SecondSimpleHandlerTab } from './CodeTabs/SecondSimpleHandler';
import { TwoHandlerBrokerTab } from './CodeTabs/TwoHandlerEventBroker';
import { ExecuteTab } from './CodeTabs/ExecuteTab';

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
              through a fully functional EDA application that runs and tests locally without requiring any 
              cloud infrastructure.

              As you progress through the documentation, you'll discover how this same console application 
              can be deployed as a web service using frameworks like HonoJS, then scaled to distributed 
              microservices architectures with event brokers—all without modifying your business logic.

              > **Key Concept**: Arvo's architecture is elegantly simple. Every functional component is an 
              > event handler that communicates through \`ArvoEvent\` messages. Handlers maintain cohesion 
              > through enforced contracts called \`ArvoContract\`, ensuring reliable interactions without 
              > tight coupling.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## What Are You Building?

              This tutorial guides you through building progressively sophisticated event-driven patterns, 
              **starting with fundamentals and advancing to orchestration strategies all running locally** in a 
              console application.

              You'll **begin by** creating a **simple event handler that sums a list of numbers and executes it 
              directly**. Next, you'll **build a second handler that accepts a name and returns a personalized 
              greeting**. At this stage, you'll also work with Arvo's **in-memory** FIFO queue-based **event broker**, 
              designed specifically **for local testing and development**. You'll register both handlers with this 
              broker, which manages event routing automatically.

              Building on these foundations, you'll explore **Arvo's key composition patterns** by creating an 
              **orchestrator—a specialized event handler that coordinates workflows through event emission 
              rather than direct processing**. Using state charts and state machines, you'll implement 
              event-driven orchestration where a single triggering event initiates both greeting and addition 
              operations through the broker. This demonstrates **a distinctive orchestration** model where the 
              orchestrator operates as a start-stop event handler in the Arvo fabric, **without centralized system 
              control**.

              Finally, you'll discover **Arvo's second orchestration paradigm-imperative orchestration**. This 
              approach allows you to **control workflows through natural code flow** while maintaining the same 
              start-stop event handler architecture that underpins the entire system.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer>
        <div className={Md3ContentPadding}>
          <div className='grid grid-cols-1 gap-4'>
            {[
              AdditionHandlerTab,
              SimpleHandlerExecutionTab,
              SecondSimpleHandlerTab,
              TwoHandlerBrokerTab,
              GreetingOrchestratorTab,
              GreetingResumableTab,
              ExecuteTab,
            ].map((item, index) => (
              <React.Fragment key={index.toString()}>
                <div className={`grid grid-cols-1 gap-4 ${item.singlePanel ? '' : 'xl:grid-cols-2'}`}>
                  <div className={Md3Cards.filled}>
                    <div className={Md3Cards.inner.content}>
                      <h2 className={Md3Typography.headline.large}>{item.heading}</h2>
                      <Separator padding={8} />
                      <ReMark content={item.description} />
                    </div>
                  </div>
                  <CodeBlock tabs={item.tabs} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
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
