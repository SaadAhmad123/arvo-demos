import { cleanString } from 'arvo-core';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { Md3ContentPadding } from '../../../../classNames';
import {
  ArvoEventHandlerLearn,
  ArvoMachineLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../../../components/LearningTiles/data';
import { Demo } from './Demo';

export const ArvoAgenticParadigmPage = withNavBar(() => {
  return (
    <main>
      {/* <button onClick={() => testArvoDemo()} type='button'>
        Execute
      </button> */}
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 xl:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>Agentic AI Paradigm</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                In Arvo, agents are simply event handlers. They communicate with the same reliability guarantees as any
                other service, and no longer face architectural barriers to participating in distributed workflows.
              </p>
            </div>
          </div>
          <img
            alt='arvo agentic paradigm illustration'
            src='/arvo-agentic-paradigm.png'
            className='rounded-3xl object-cover lg:h-full'
          />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # What is an Agent?

              In computer science, Agents have been studied since the 1970s, with roots 
              in the [Actor Model](https://en.wikipedia.org/wiki/Actor_model) and [Distributed Artificial Intelligence](https://en.wikipedia.org/wiki/Distributed_artificial_intelligence),
              and became a major research focus in the 1990s under the field of [Agent Oriented Programming](https://en.wikipedia.org/wiki/Agent-oriented_programming) and[Multi-Agent Systems](https://en.wikipedia.org/wiki/Multi-agent_system). 
              Early mechanisms such as [contract-net protocols](https://en.wikipedia.org/wiki/Contract_Net_Protocol), [facilitator/mediator agents](https://www.researchgate.net/publication/2598082_Facilitators_Mediators_Or_Autonomous_Agents), and 
              [mixed-initiative interactions](https://erichorvitz.com/chi99horvitz.pdf) explored how agents could coordinate tasks 
              and collaborate with humans. Today, large language models provide a powerful 
              new intelligence for building agentic systems, but the conceptual 
              foundations are long established.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Arvo's agentic paradigm draws inspiration from the established body of work on agent systems and adopts the following [commonly accepted characteristics](https://en.wikipedia.org/wiki/Software_agent) of an agent:

              - **Persistence:** Agents are not invoked only on demand; they maintain context and can remain in a "waiting" state, resuming activity when appropriate.  
              - **Autonomy:** Agents exhibit a degree of intelligence, enabling them to decompose problems, select and prioritize tasks, and make decisions without constant human intervention.  
              - **Social Ability:** Agents are inherently collaborative; they can communicate and coordinate with other agents, systems, and humans, and can delegate tasks when needed.  
              - **Reactivity:** Agents perceive and respond to changes in their environment, using memory and context to determine when and how to act.  
              - **Goal Orientation:** Beyond reactivity, agents pursue well-defined goals, balancing short-term actions with long-term objectives.  
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Agents in Arvo

              Arvo is an event-driven application layer that abstracts the underlying 
              infrastructure—such as event brokers and state databases—while providing 
              strong guarantees around reliability, observability, and developer experience 
              at the application tier. Within Arvo, there are three kinds of event handlers, 
              each orthogonal in capability and covered in detail in their respective 
              documentation:

              - [\`ArvoEventHandler\`](${ArvoEventHandlerLearn.link}) is the most basic event handler. 
              It consumes an event and produces one or more resulting events. These handlers operate 
              in isolation and do not coordinate with other handlers during execution. Conceptually, 
              they represent a **request-response model** in Arvo's event-driven design.

              - [\`ArvoOrchestrator\`](${ArvoOrchestratorLearn.link}) provides an execution environment
              for state machine definitions (see [\`ArvoMachine\`](${ArvoMachineLearn.link})). Unlike 
              traditional systems with a single central orchestrator, Arvo treats orchestrators as 
              specialized event handlers that can collaborate with others. When orchestration is 
              needed, the handler generates the required events (based on \`ArvoMachine\` state machine), 
              persists its current state in a key-value store, emits the events, and then **pauses**. 
              While waiting for responses, the orchestrator releases CPU and memory. When new events 
              arrive, it restores state and resumes processing to determine the next transition. 
              This **start-stop model** enables efficient, scalable workflows.

              - [\`ArvoResumable\`](${ArvoResumableLearn.link}) behaves similarly to the \`ArvoOrchestrator\` 
              at runtime, but instead of relying on declarative \`ArvoMachine\` state machines, it allows 
              workflows to be defined **imperatively** using standard programming constructs. This makes it 
              possible to implement dynamic, context-dependent workflow logic and to call external APIs 
              directly—capabilities that a declarative [\`ArvoMachine\`](${ArvoMachineLearn.link}) cannot 
              provide. Resumables are especially well-suited for agentic and adaptive workflows.  
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Realizing Agents in Arvo

              The agentic characteristics defined above are naturally embodied by Arvo's 
              event handlers, transforming them from simple processing units into true software 
              agents with state, perception, and collaborative capabilities.

              ## ArvoResumable—The Natural Agent

              \`ArvoResumable\` represents the most direct implementation of the agentic 
              paradigm in Arvo. These handlers **perceive their environment** through incoming 
              \`ArvoEvent\` messages and **communicate with the broader system** by emitting their 
              own events, fulfilling the social ability requirement. They **maintain persistence** 
              by storing state in a key-value database and retrieving it to resume processing when
              new events arrive. 
              
              What makes \`ArvoResumable\` particularly powerful for agentic workflows is 
              its **reactivity to relevant events** combined with the **autonomy provided by 
              modern large language models**. When integrated with AI capabilities, these agents
              can **autonomously navigate complex problems**, make **contextual decisions**, and pursue 
              well-defined goals **without constant supervision**. 
              
              Beyond basic agent characteristics, \`ArvoResumable\` provides agents with comprehensive 
              \`ArvoContract\` definitions for all services they can interact with. This eliminates 
              runtime discovery overhead, reduces error potential, and allows developers to define 
              precise operational scopes. This scoping mechanism enhances system reliability and 
              security by creating predictable, bounded agent behavior while maintaining the 
              flexibility needed for complex workflows.

              ## ArvoEventHandler—External Intelligence Integration

              \`ArvoEventHandler\` instances serve as bridges between Arvo's internal agentic 
              ecosystem and external intelligent systems. They excel at integrating with 
              modern [Model Context Protocol (MCP) servers](https://modelcontextprotocol.io/docs/getting-started/intro)
              and other systems, enabling LLMs to interact with external environments and tools. 
              While these handlers cannot perform internal Arvo system communication (unlike the other two event handler) 
              state during processing, they are perfectly suited for agents that need to gather intelligence from external 
              sources and share results with the broader Arvo agent network.

              ## ArvoOrchestrator—Structured Workflow Agents

              Though \`ArvoOrchestrator\` handlers don't directly integrate LLM intelligence, 
              they provide essential structural foundation for agentic systems. By executing state machine 
              workflows defined through \`ArvoMachine\`, they create reliable, predictable processes that 
              intelligent agents can invoke and depend upon. This separation of concerns allows 
              expensive AI intelligence to focus on decision-making while delegating well-defined, 
              deterministic workflows to orchestrators.

              ## Domain-Based Event Routing

              The \`domain\`-based \`ArvoEvent\` routing enables sophisticated routing 
              behavior by examining the \`domain\` field in event data. This allows events to
              be routed to systems that can invoke human interaction, enabling truly human-in-the-loop
              workflows without interrupt-based programming. This pattern allows both \`ArvoResumable\` 
              and \`ArvoOrchestrator\` handlers to wait for human interaction for extended periods 
              without consuming compute resources. This approach will be explored further in the 
              human-in-the-loop documentation.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The true power of Arvo's agentic paradigm emerges from the collaboration between 
              these different handler types. Intelligent \`ArvoResumable\` agents can coordinate 
              with structured \`ArvoOrchestrator\` workflows and leverage \`ArvoEventHandler\` 
              integrations, all through the same unified \`ArvoEvent\` data structure and event-driven communication paradigm. 
              This creates a heterogeneous agent network where specialized capabilities combine 
              to solve complex, multi-faceted problems that no single agent could address alone.
            `)}
          />
        </div>
      </ContentContainer>
      <Demo />

      <Separator padding={72} />
    </main>
  );
});
