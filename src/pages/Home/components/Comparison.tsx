import { Md3ContentPadding } from '../../../classNames';
import { Md3Typography } from '../../../classNames/typography';
import { ContentContainer } from '../../../components/ContentContainer';
import { ReMark } from '../../../components/ReMark';
import { Separator } from '../../../components/Separator';

export const Comparison: React.FC = () => (
  <>
    <ContentContainer content>
      <div className={Md3ContentPadding}>
        <h1 className={`${Md3Typography.headline.large} text-on-surface-variant font-light`}>
          Is Arvo the Right Tool for You?
        </h1>
        <Separator padding={8} />
        <p className={`${Md3Typography.body.large}`}>
          Arvo is designed as a modern alternative to traditional workflow and orchestration systems. It brings a
          TypeScript-native approach with strong type safety, infrastructure independence, and seamless integration of
          both AI-driven and business workflows. Unlike many similar systems that enforce rigid architectures or lock
          you into a single platform, Arvo emphasizes composability, portability, and evolvability—allowing teams to
          start small and scale to enterprise workloads without rewrites. The comparison below highlights how Arvo’s
          approach differs from other solutions in this space.
        </p>
      </div>
    </ContentContainer>
    <ContentContainer content>
      <ReMark
        content={`
| **Criteria** | **Arvo** | **Temporal** | **LangGraph** | **Akka** | **AWS Step Functions** |
|---|---|---|---|---|---|
| **Primary Use Case** | Event-driven systems combining AI and business workflows with contract-driven evolution and horizontal scalability | Durable workflows requiring retries, compensation, and guaranteed execution | Multi-step AI agent orchestration with memory and tool usage | Reactive, high-concurrency systems with actor-based state management | AWS-native workflow automation with visual design |
| **Architecture** | Infrastructure-agnostic with strongly typed contracts, decentralized event routing, and flexible deployment across runtimes and brokers | Centralized workflow engine with limited compile-time safety outside workflow signatures | Graph-based orchestration using Python with type hints and runtime validation | Actor model with strong type safety in Scala/Java and isolated message-driven state | Serverless state machines defined in JSON, tightly coupled with AWS services |
| **Scalability** | Horizontally scales via event brokers; moderate operational complexity for broker management | Scales with Temporal cluster; requires significant operational overhead for self-hosting | Limited horizontal scaling; primarily single-process with optional worker distribution | Built for massive scale with cluster sharding and distributed actor management | Scales automatically within AWS limits; minimal operations but constrained by service quotas |
| **AI & Agentic Workflows** | Native support for resumable agentic service orchestration, tool orchestration, and human-in-the-loop coordination | Custom activities required; no built-in abstractions for LLM or tool workflows | Purpose-built for AI with primitives for memory, coordination, and human involvement | No AI-specific abstractions; requires custom modeling in the actor paradigm | AI integration possible via Lambdas; lacks native abstractions for LLM or agent workflows |
| **Vendor Lock-In** | Platform-neutral. Runs on serverless, containers, or monoliths with support for multiple brokers and storage backends. TypeScript ecosystem focus | Open source with optional managed service; primarily container-based deployments | Python-based; portable across multiple environments but tied to Python runtime | JVM-based; portable across cloud or on-premises with multi-language JVM support | Fully managed by AWS; tightly coupled with Lambda, Step Functions, and CloudWatch |
| **Observability** | Built-in OpenTelemetry with distributed tracing, metrics, and correlation | Rich UI with workflow history, timelines, and debugging tools | Basic logging and tracing; advanced monitoring requires external tools | Cluster monitoring, actor system metrics, and tracing via Akka Management | Integrated with CloudWatch and X-Ray for logging, metrics, and visual flow tracking |
  `.trim()}
      />
    </ContentContainer>
  </>
);
