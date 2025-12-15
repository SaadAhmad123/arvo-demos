import {} from 'react-icons/md';
import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  AgenticResumableDesignLearn,
  AgenticSystemExampleLearn,
  EventRoutingAndBrokerInArvoLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { ArvoAgentAnatomy } from './Anatomy';
import { Demo } from './Demo';

export const ArvoAgenticParadigmPage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 xl:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{AgenticResumableDesignLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Build ecosystems of Agents, Workflow, Services and People—all coordinating through the same event-driven
                patterns.
              </p>
              <Separator padding={24} />
              <a
                href='https://seanfalconer.medium.com/ai-agents-must-act-not-wait-a-case-for-event-driven-multi-agent-design-d8007b50081f'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read, <i>"AI Agents Must Act; Not Wait"</i>
              </a>
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
              At its core, an agent is software that autonomously pursues goals 
              by perceiving its environment, making decisions, and taking actions 
              to achieve objectives. Unlike non-agentic software that executes 
              predetermined instruction sequences, agents exhibit autonomy—they 
              determine their own action sequences based on observations and internal 
              state without requiring explicit external commands for each step.

              What distinguishes modern agentic systems is the addition of 
              intelligence through AIs such as large language models. This enables agents 
              to interpret their input more intelligently, reason about ambiguous situations, 
              and dynamically compose action sequences that weren't explicitly programmed.\

              ## Agents in Arvo

              All event handlers in Arvo naturally exhibit agentic behavior. They are functions 
              that react to events based on their internal logic and, in the case of \`ArvoOrchestrator\` 
              and \`ArvoResumable\`, their internal state. \`ArvoResumable\` particularly provides 
              an excellent platform for building truly agentic software by integrating large 
              language models. 

              Agents in Arvo can exhibit complex agentic behaviors by executing tools across various modalities. 
              They can use internal synchronous functions for immediate computation or bespoke tasks, 
              Model Context Protocol (MCP) connections to access external resources, and participate in the 
              event fabric to collaborate with other components. Agents interact seamlessly with workflows, 
              other agents, humans, and external systems using the same event-driven patterns that govern 
              the entire system, making them architectural peers rather than privileged orchestrators.

              <br/>
              <br/>

              # What is \`ArvoAgent\`?


              \`ArvoAgent\` is a sophisticated pattern implementation of \`ArvoResumable\`, 
              provided by the \`@arvo-tools/agentic\` package, that enables 
              you to build agentic event handlers powered by large language models. It encapsulates the 
              operational architecture, which acts as a harness, necessary for LLM-driven agents to 
              participate reliably in your application or event-driven system as trustworthy, 
              observable components.

              The internal architecture of \`ArvoAgent\` separates AI intelligence from operational 
              mechanics. The LLM focuses exclusively on reasoning. It interprets ambiguous 
              situations, decides which actions to take, and composes response sequences. 
              Meanwhile, the operational harness handles everything else. It routes tool 
              requests to the appropriate execution strategy, enforces permission policies, manages 
              error feedback loops, maintains conversation state, and coordinates with the 
              broader system. This separation allows the AI to do what it does best while 
              \`ArvoAgent\` ensures those decisions execute reliably and safely.
              
              This architectural separation makes agents trustworthy despite using AI. Because 
              operational concerns are enforced by the harness rather than relying on LLM behavior, 
              the system guarantees deterministic handling of permissions, execution priorities, and 
              error recovery regardless of what the model decides. An agent cannot bypass permission 
              checks through prompt manipulation, cannot ignore priority-based execution ordering, 
              and cannot corrupt state during failures. This provides the reliability envelope that 
              allows AI-driven decision-making to integrate safely with workflows, external systems, 
              and human collaboration.

              <br/>
              <br/>

              ## The Anatomy of \`ArvoAgent\`
              
              The following diagram illustrates the architecture components
              of \`ArvoAgent\`, showing how it layers the agentic implementation on top 
              the foundational capabilities of \`ArvoResumable\`. Each component represents a 
              distinct responsibility in the operational harness that enables reliable 
              LLM-driven agent execution.

              <br/>
              <br/>
            `)}
          />
          <ArvoAgentAnatomy />
        </div>
      </ContentContainer>
      <Demo />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The following examples illustrate representative execution traces of AI Agents, captured using **Arize Phoenix**.  
              These traces provide visibility into agent behavior, decision-making, and workflow execution, helping developers 
              analyze performance and refine system design.
            `)}
          />
          <Separator padding={18} />
          <div className='grid grid-cols-2 gap-4'>
            <a href='/WebInfoAgentTrace.png' target='_blank' rel='noreferrer'>
              <img
                alt='Web Information Agent Execution Trace'
                src='/WebInfoAgentTrace.png'
                className='rounded-3xl shadow'
              />
            </a>
            <a href='/CalculatorAgentTrace.png' target='_blank' rel='noreferrer'>
              <img
                alt='Calculator Agent Execution Trace'
                src='/CalculatorAgentTrace.png'
                className='rounded-3xl shadow'
              />
            </a>
          </div>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Agentic Approach in Arvo

              Arvo takes a pragmatic stance on agentic development. **AI agents are not the centerpiece of the system**, but 
              rather one of many composable tools for delivering value to users. The focus remains **value-centric, with agents 
              treated as standard components** that seamlessly integrate into broader workflows.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Arvo guiding principal here is that your **AI Agents must become a part of the system rather than making the system a part of the Agent**.
              The factory and integration patterns may initially appear sophisticated, but they are intentionally designed for ease of use and flexibility. 
              They are provided so that you as developer can copy them directly into your projects, gaining both immediate productivity 
              and full transparency over the internal architecture. This approach avoids constant version churn and gives you 
              complete control to adapt agents as AI technologies evolve.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              A **key strength of this Agent design approach is its uniformity**. These Arvo-based agents interoperate with other Arvo-based agents, 
              orchestrators, and event handlers using the same communication patterns—without special protocols or bespoke infrastructure. 
              This consistency reduces architectural overhead, simplifies integration, and increases system reliability.
              Furthermore, just like the rest of Arvo, this agentic factory is built with developer experience and operational robustness in mind. 
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              In further sections, we will explore practical agentic patterns you can adopt to build software that delivers meaningful 
              value—where agents enhance your system naturally.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <PageNavigation
        previous={{
          link: EventRoutingAndBrokerInArvoLearn.link,
          heading: EventRoutingAndBrokerInArvoLearn.name,
          content: EventRoutingAndBrokerInArvoLearn.summary,
        }}
        next={{
          link: AgenticSystemExampleLearn.link,
          heading: AgenticSystemExampleLearn.name,
          content: AgenticSystemExampleLearn.summary,
        }}
      />
      <Separator padding={72} />
    </main>
  );
});
