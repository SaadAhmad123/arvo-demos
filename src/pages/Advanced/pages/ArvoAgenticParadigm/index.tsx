import {
  MdAutorenew,
  MdPsychology,
  MdPeople,
  MdVisibility,
  MdFlag,
  MdAutoAwesome,
  MdExtension,
  MdAccountTree,
} from 'react-icons/md';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { Md3ContentPadding } from '../../../../classNames';
import { AgenticSystemExampleLearn, EventRoutingAndBrokerInArvoLearn } from '../../../../components/LearningTiles/data';
import { Demo } from './Demo';
import { PageNavigation } from '../../../../components/PageNavigation';
import { Md3Buttons } from '../../../../classNames/buttons';
import { cleanString } from '../../../../utils';
import { Link } from 'react-router';

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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>Agentic AI Paradigm</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Arvo's event-driven design naturally mirrors true agentic behavior, letting you build systems that don't
                just scale—they evolve.
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
            // TODO - Make the following content professional, better and remove informatuionredundancies.
            // Also give it s abeter reading flow than the current strucutre. No need to give me the same
            // content rather give me somethign better with the same essense
            content={cleanString(`
              Arvo's agentic paradigm takes a different approach than frameworks like LangGraph or protocols like MCP. 
              It's an event-driven toolkit that provides application-tier constructs for building reliable event driven 
              applications inTypeScript. Its **event-driven nature naturally enables truly agentic behavior**.


              Understanding Arvo's agentic paradigm requires a mindset shift. Agency (the AI Agentic behaviour) isn't 
              a special feature bolted onto Arvo rather it emerges organically from its design. **AI Agent
              isn't a separate components in the toolkit; it a pattern derived from Arvo's primitives.**
              This deliver genuinely agentic systems with enterprise-grade observability, scalability, 
              reliability, evolvability, and security. Since agents are just event handlers with specific
              agentic logic and intelligence, they integrate seemlessly within the Arvo's event-driven fabric.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Agentic Software

              Arvo's agentic paradigm draws inspiration from the established body of work on agent systems and adopts the following [commonly accepted characteristics](https://en.wikipedia.org/wiki/Software_agent) of a software agent:
            `)}
          />
          <Separator padding={18} />
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4'>
            {[
              {
                title: 'Persistance',
                description:
                  'Agents are not invoked only on demand; they maintain context and can remain in a "waiting" state, resuming activity when appropriate.',
                icon: MdAutorenew,
              },
              {
                title: 'Autonomy',
                description:
                  'Agents exhibit a degree of intelligence, enabling them to decompose problems, select and prioritize tasks, and make decisions without constant human intervention.',
                icon: MdPsychology,
              },
              {
                title: 'Social Ability',
                description:
                  'Agents are inherently collaborative; they can communicate and coordinate with other agents, systems, and humans, and can delegate tasks when needed.',
                icon: MdPeople,
              },
            ].map(({ title, description, icon: Icon }, index) => (
              <div key={index.toString()} className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <div className='flex items-center gap-4'>
                    <Icon className='size-8' />
                    <h1 className={Md3Typography.headline.medium}>{title}</h1>
                  </div>
                  <Separator padding={8} />
                  <p className={Md3Typography.body.medium}>{description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            {[
              {
                title: 'Reactivity',
                description:
                  'Agents perceive and respond to changes in their environment, using memory and context to determine when and how to act.',
                icon: MdVisibility,
              },
              {
                title: 'Goal Orientation',
                description:
                  'Beyond reactivity, agents pursue well-defined goals, balancing short-term actions with long-term objectives.',
                icon: MdFlag,
              },
            ].map(({ title, description, icon: Icon }, index) => (
              <div key={index.toString()} className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <div className='flex items-center gap-4'>
                    <Icon className='size-8' />
                    <h1 className={Md3Typography.headline.medium}>{title}</h1>
                  </div>
                  <Separator padding={8} />
                  <p className={Md3Typography.body.medium}>{description}</p>
                </div>
              </div>
            ))}
          </div>
          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Implementing Agents in Arvo

              In Arvo, there are three kinds of event handlers, each orthogonal in capability and
              covered in detail in their respective documentation. The agentic characteristics 
              defined above are naturally embodied by these Arvo's event handlers, enabling you 
              to define the agentic logic in them and making those agents participate in the broader 
              Arvo event-driven eco-system.
            `)}
          />
          <Separator padding={18} />
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4'>
            {[
              {
                icon: MdAutoAwesome,
                title: 'Agentic Orchestators',
                button: {
                  title: 'Explore imperative orchestrators',
                  link: '/learn/arvo-resumable',
                },
                description: cleanString(`
                  \`ArvoResumable\` provides the most direct implementation of the agentic paradigm in Arvo. 
                  These start-stop imperative orchestrators enable you to define dynamic workflows through 
                  TypeScript code rather than state charts. Event handlers interact within the Arvo fabric 
                  via events defined by service contracts registered with the handler. Their ability to 
                  implement dynamic workflows and orchestrate other event handlers makes them ideal for 
                  AI-driven workflows. In these scenarios, an AI connected via external API calls determines 
                  the next events to emit based on the current state and event context, which can then 
                  trigger other Arvo event handlers, orchestrators, and agents.
                `),
              },
              {
                icon: MdExtension,
                title: 'Tooled Agents',
                button: {
                  title: 'Explore event handlers',
                  link: '/learn/arvo-event-handler',
                },
                description: cleanString(`
                  \`ArvoEventHandler\` operates at a different layer of the architecture, focusing on the boundary
                  between Arvo and the outside world. These handlers serve as the bridge between Arvo's event-driven
                  architecture and external APIs, including Model Context Protocol servers. Rather than coordinating 
                  internal workflows, they specialize in managing interactions with external systems and tools. 
                  They receive request events from within Arvo, invoke external services, coordinate AI-driven tool 
                  execution, and return results through response events. This enables AI agent systems to leverage
                  external capabilities while maintaining the event-driven structure.
                `),
              },
            ].map(({ title, description, button, icon: Icon }, index) => (
              <div key={index.toString()} className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <div className='flex items-center gap-4'>
                    <Icon className='size-8' />
                    <h1 className={Md3Typography.headline.medium}>{title}</h1>
                  </div>
                  <Separator padding={8} />
                  <ReMark content={description} />
                  <Separator padding={8} />
                  <Link to={button.link} className={Md3Buttons.filled}>
                    {button.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className='grid grid-cols-1 gap-4'>
            {[
              {
                icon: MdAccountTree,
                title: 'Structured Workflows',
                button: {
                  title: 'Explore static orchestrators',
                  link: '/learn/arvo-orchestrator',
                },
                description: cleanString(`
                  \`ArvoOrchestrator\` event handlers occupy a complementary space in Arvo's agentic paradigm. 
                  These handlers execute state-machine workflows defined through ArvoMachine, creating 
                  reliable and predictable processes. Agentic orchestrators implemented via \`ArvoResumable\` 
                  can delegate deterministic execution to \`ArvoOrchestrator\` or be deterministically invoked 
                  by it. \`ArvoOrchestrator\` can also invoke agents implemented via \`ArvoEventHandler\`, though 
                  these agents cannot invoke \`ArvoOrchestrator\` in return. This enables structured collaboration 
                  between deterministic and agentic paradigms.  
                `),
              },
            ].map(({ title, description, button, icon: Icon }, index) => (
              <div key={index.toString()} className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <div className='flex items-center gap-4'>
                    <Icon className='size-8' />
                    <h1 className={Md3Typography.headline.medium}>{title}</h1>
                  </div>
                  <Separator padding={8} />
                  <ReMark content={description} />
                  <Separator padding={8} />
                  <Link to={button.link} className={Md3Buttons.filled}>
                    {button.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Separator padding={18} />

          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The true power of Arvo's agentic paradigm emerges from the seamless composition of 
              these handler types. Intelligent agentic orchestrators coordinate with deterministic 
              workflows and leverage external tool using agents, all communicating through the unified 
              event-driven fabric. The result is an architectural pattern where agentic intelligence, deterministic reliability, 
              and external integration work in concert within a cohesive event-driven system.

              ## What are you building?

              Let's explore agentic implementation in Arvo by creating factory functions for 
              two core agent types: 

              - **Agentic Resumables** which are the agentic orchestrators
              - **MCP Agents** which are MCP connected agents

              These factories encapsulate common agentic logic and return fully configured event handlers ready to 
              participate in Arvo's fabric. You'll then build AI agents and integrate them into Arvo's event-driven system.

              > **Recommendation:** It is strongly encouraged that yoy copy the factory methods and accompanying files into your codebase and start 
              > building AI agents. The following code is production-ready and follows the **shadcn philosophy** of 
              > copy-paste integration, allowing you to leverage the agentic paradigm immediately. You can also **clone 
              > the code from [Arvo's example project](https://github.com/SaadAhmad123/arvo-example-project/tree/main/src/agentFactory)**, make
              > sure to copy paste all the contents of the folder.
              
            `)}
          />
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
