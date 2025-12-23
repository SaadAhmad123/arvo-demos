import {} from 'react-icons/md';
import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  AgenticResumableDesignLearn,
  ArvoContractLearn,
  ArvoMachineLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { ArvoAgentAnatomy } from './Anatomy';
import { Demo } from './Demo';
import { LearningTiles } from '../../../../components/LearningTiles';
import { executionDiagram } from './ExecutionDiagram';

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
                Build applications, systems, and experiences where intelligence, automation, and human judgment
                collaborate naturally to achieve value.
              </p>
              <Separator padding={24} />
              <a
                href='https://www.confluent.io/blog/the-future-of-ai-agents-is-event-driven/'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read <i>"Future of Agentic AI is Event-Driven"</i>
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
              operational architecture, which acts as a kernel, necessary for LLM-driven agents to 
              participate reliably in your application or event-driven system as trustworthy, 
              observable components.

              The internal architecture of \`ArvoAgent\` separates AI intelligence from operational 
              mechanics. The LLM focuses exclusively on reasoning. It interprets ambiguous 
              situations, decides which actions to take, and composes response sequences. 
              Meanwhile, the agentic kernel handles everything else. It routes tool 
              requests to the appropriate execution strategy, enforces permission policies, manages 
              error feedback loops, maintains conversation state, and coordinates with the 
              broader system. This separation allows the AI to do what it does best while 
              \`ArvoAgent\` ensures those decisions execute reliably and safely.
              
              This architectural separation makes agents trustworthy despite using AI. Because 
              operational concerns are enforced by the kernel rather than relying on LLM behavior, 
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
              distinct responsibility in the agentic kernel that enables reliable 
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
              # Telemetry Integration


              Just like every component in Arvo, \`ArvoAgent\` is also fully 
              integrated with Opentelemetry and OpenInference. 
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
              # Advanced Topics

              The \`ArvoAgent\` represents a sophisticated implementation of the agentic pattern 
              built on the \`ArvoResumable\` foundation, orchestrating complex interactions between 
              LLMs, tools, permission systems, and event-driven coordination. To help you understand 
              its internal execution lifecycle, the detailed sequence diagram below visualizes every 
              critical phase—from initialization and context building through tool execution, 
              permission validation, and output generation.

              This diagram serves as an essential reference for advanced use cases including custom 
              tool execution strategies, debugging complex agent behaviors, understanding suspend-resume 
              mechanics, and implementing custom permission managers or LLM integrations. When building 
              sophisticated multi-agent systems or troubleshooting production issues, this diagram 
              helps you trace exactly how agents process events, manage state, and coordinate with 
              external systems.

              For **error boundary behavior and violation handling**, \`ArvoAgent\` inherits the same 
              robust patterns from [\`ArvoResumable\`](${ArvoResumableLearn.link}). Visit the 
              ArvoResumable documentation to understand how agents handle operational errors, 
              configuration violations, and state persistence failures.

              > **Pro Tip**: Click the copy button to extract the diagram definition. Paste it into any 
              AI chat interface (ChatGPT, Claude, etc.) to ask questions like "How does the priority 
              manager work?", "What happens when a tool requires permission?", or "How are MCP tools 
              executed?". This makes the diagram interactive—you can query specific execution paths 
              without manually parsing the entire sequence.

              <br/>
              <br/>

              \`\`\`mermaid
              ${executionDiagram}
              \`\`\`

              <br/>
              <br/>


              # The Agentic Approach in Arvo

              Arvo takes a pragmatic stance on agentic development. **AI agents are not the centerpiece of the system**, but 
              rather one of many composable tools for delivering value to users. The focus remains **value-centric, with agents 
              treated as standard components** that seamlessly integrate into broader workflows.

              Arvo guiding principal here is that your **AI Agents must become a part of the system rather than making the system a part of the Agent**.
              The factory and integration patterns may initially appear sophisticated, but they are intentionally designed for ease of use and flexibility. 
              They are provided so that you as developer can copy them directly into your projects, gaining both immediate productivity 
              and full transparency over the internal architecture. This approach avoids constant version churn and gives you 
              complete control to adapt agents as AI technologies evolve.


              A **key strength of this Agent design approach is its uniformity**. These Arvo-based agents interoperate with other Arvo-based agents, 
              orchestrators, and event handlers using the same communication patterns—without special protocols or bespoke infrastructure. 
              This consistency reduces architectural overhead, simplifies integration, and increases system reliability.
              Furthermore, just like the rest of Arvo, this agentic factory is built with developer experience and operational robustness in mind. 
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pb-8!`}>
          <ReMark content={'# Related Topics'} />
        </div>
        <LearningTiles
          data={[ArvoMentalModelLearn, ArvoMachineLearn, ArvoOrchestratorLearn, ArvoResumableLearn, ArvoContractLearn]}
        />
      </ContentContainer>
      <Separator padding={72} />
    </main>
  );
});
