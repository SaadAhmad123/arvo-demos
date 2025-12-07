import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { ArvoContractLearn, ArvoEventFactoryLearn, ArvoEventLearn } from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';
import { RiDoubleQuotesL } from 'react-icons/ri';

export const ArvoContractPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoContractLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Excutable agreements that make the system predictable and maintainable while keeping services
                independent and easy to evolve.
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-core/documents/ArvoContract.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img alt='arvo event illustration' src='/arvo-contract.png' className='rounded-3xl object-cover lg:h-full' />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <blockquote>
            <RiDoubleQuotesL className='text-on-surface text-4xl opacity-50 mb-2' />
            <p className={Md3Typography.headline.large}>
              Complexity is not difficulty. Complexity isn't a system's breadth, either.{' '}
              <strong>Complexity is when systems interact with each other</strong>. A complex system can become{' '}
              unreasonable.
            </p>
            <footer className={`${Md3Typography.headline.small} opacity-75 mt-4`}>
              —{' '}
              <a
                target='_blank'
                href='https://youtu.be/czzAVuVz7u4?si=2wNGiLW8puZafi4P'
                rel='noreferrer'
                className='underline hover:text-blue-500 cursor-pointer'
              >
                Peter van Hardenberg
              </a>
            </footer>
          </blockquote>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Event-driven systems thrive on decoupled services that coordinate without 
              synchronous calls, instead communicating through emitted events. Yet this 
              independence requires cohesion through shared understanding of data structures 
              and event types.

              ## Contract Governance Challenge

              Traditional event-driven architectures face a critical weakness where contracts 
              exist as separate specifications or documentation, distinct from their implementations. 
              Whether code is auto-generated from specs or manually written, this separation creates 
              governance fragmentation. Documentation diverges from implementation, leading to
              contract drift and maintenance challenges. This approach prioritizes language 
              flexibility over contractual integrity.

              ## Arvo's Approach — Contract-First Development

              Arvo addresses service coupling challenges by elevating contracts to first-class 
              citizens through the \`ArvoContract\` class. Rather than services coupling directly 
              to one another, they bind to \`ArvoContract\` instances that serve as both 
              enforceable specifications and living documentation. Event handlers attach directly 
              to these contract objects, establishing them as unified sources of truth that provide 
              runtime validation, type-safe event factories, compile-time verification, and 
              comprehensive IDE support. This architecture eliminates the specification-implementation 
              gap that undermines traditional contract systems.

              The **core development pattern requires defining contracts before writing service logic**. 
              While this may feel counterintuitive if you typically build services first and document 
              later, it compels deliberate consideration of your service's data requirements and 
              return guarantees upfront.

              **Arvo maintains that strict contractual guarantees outweigh implementation language 
              flexibility for well-engineered systems**. By constraining contracts as executable 
              TypeScript artifacts, the framework delivers robust type safety and validation 
              difficult to achieve through language-agnostic approaches. Given TypeScript's 
              ubiquity in modern development, this constraint introduces minimal technological 
              friction while maximizing system reliability.
            `)}
          />

          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The \`ArvoContract\`

              The \`ArvoContract\` class forms the foundation of Arvo's contract-first development 
              model. Individual contract instances bind directly to event handlers, leveraging [Zod's](https://zod.dev/) 
              mature validation capabilities alongside sophisticated versioning and type inference 
              features.

              While you can instantiate \`ArvoContract\` objects directly, the \`arvo-core\` package 
              provides ergonomic factory methods that streamline contract creation. This dual approach 
              offers flexibility through both low-level and high-level APIs for working with contracts.

              ## The Anatomy of ArvoContract

              An \`ArvoContract\` comprises several core components that collectively define a
              comprehensive service interface:
              <br/>
              <br/>
              | Component | Description | Maps to ArvoEvent |
              |-----------|-------------|-------------------|
              | **uri** | Unique identifier following hierarchical naming patterns like \`#/services/user/registration\`, serving as the canonical contract reference across the system. | Forms the base URI portion of \`event.dataschema\`. Combined with version, it provides schema traceability for payload validation. |
              | **type** | The primary event type that implementing services accept (e.g., \`com.user.register\`), defining the entry point for service communication. | Directly populates \`event.type\` for the initiating event, establishing the operation contract between producer and consumer. |
              | **versions** | Semantically versioned schema definitions, each representing a complete, isolated contract specification. | Appended to the URI to form the complete \`event.dataschema\` path as \`{uri}/{version}\`, enabling version-specific schema resolution. |
              | **accepts** | Version-specific input schemas defining expected data structures, validated through [Zod](https://zod.dev/) schemas with full type inference. | Enforces structural validation and type safety for \`event.data\` in incoming events, ensuring payload compliance at runtime. |
              | **emits** | Version-specific dictionaries mapping output event types to their schemas, defining all possible service responses. | Dictionary keys determine valid \`event.type\` values for emitted events, while corresponding values validate the structure of \`event.data\` in response payloads. |
              <br/>
              <br/>

              Each contract version exists as a completely isolated definition. 
              Adding version 1.1.0 alongside version 1.0.0 creates two entirely separate 
              service interface with no implicit compatibility relationship. This isolation 
              ensures absolute clarity about contract behavior and eliminates subtle 
              compatibility issues. Furthermore, in the event handler documetations you will
              learn that all Arvo event handler strictly require you to implementation the 
              handler logic for all the versions in the contract.

              ### System Error Event
              
              The \`ArvoContract\` automatically includes standardized error events for each version 
              following the \`sys.{type}.error\` pattern. These error events use the reserved 
              dataschema version \`0.0.0\` since their definition remains consistent across
              all contract versions. 

              > **Note:** Arvo implements a sophisticated error boundary pattern where system error events 
              > play a critical role in maintaining architectural resilience. This pattern is explored 
              > comprehensively in its dedicated documentation page.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Value of Contract-First Approach

              At first glance, an \`ArvoContract\` may appear verbose. In practice, this perceived verbosity 
              represents concentrated leverage: a single, executable definition serves as the canonical source of 
              truth for your system's behavior.

              Rather than fragmenting types, validation rules, event specifications, and documentation 
              across disparate files and formats, you define them once within a contract. Arvo then derives 
              and maintains a comprehensive ecosystem of artifacts that would otherwise require manual creation 
              and synchronization:

              - **Compile-time type safety** for event producers, consumers, handlers, and orchestrators
              - **Runtime validation** with precise, actionable error messages
              - **JSON Schema generation** for documentation and interoperability
              - **Event factory integration** that eliminates boilerplate while enforcing correctness
              - **Rich, structured metadata** enabling AI agent discovery and invocation
              - **Strong foundations** for property-based and contract-based testing
              - **Deep TypeScript IntelliSense** delivering an ergonomic developer experience

              All of these capabilities flow from a single, versioned contract definition. There exists no 
              separate specification to update, no parallel validation layer to maintain, and no opportunity 
              for silent divergence between documentation and implementation. The contract itself constitutes 
              executable governance: it enforces what events can be sent, what responses can be emitted, and 
              how services are permitted to evolve.

              Because contracts support explicit versioning, multiple versions can safely coexist within the
              same system. This enables incremental feature rollouts, A/B testing of service behaviors, and gradual 
              consumer migration—all without disrupting existing workflows. Instead of relying on ad-hoc compatibility 
              layers or requiring tightly coordinated deployments, you establish clear, enforced boundaries 
              with a predictable evolution path, anchored in one definitive contract per interface.

              <br/>
              <br/>

              # Contract Versioning and System Evolution

              Throughout the \`ArvoContract\` examples, you've encountered version definitions 
              embedded within contract specifications. System evolution is a first-class concern 
              in Arvo, alongside scalability and reliability. The distributed nature of 
              event-driven architectures introduces unique challenges that **traditional version 
              control systems like Git cannot adequately address.**

              ## Why Versioning Matters?

              Once an application runs in production, changing service interfaces, and consequently 
              event structures and handler implementations, can break in-flight processes and 
              active workflows. Futhermore, production systems often require gradual rollouts, A/B testing 
              for specific services, or parallel execution of multiple implementation versions. 
              The codebase must maintain complete backward compatibility until the entire system 
              transitions to newer versions.

              ## Arvo's Explicit Version Pattern

              For these reasons, \`ArvoContract\` makes versioning explicit and enforceable. 
              Event handlers, as you'll discover in subsequent documentation, are required by the 
              TypeScript compiler, as well as run-time checks, to satisfy all contract versions 
              simultaneously, ensuring robust evolution patterns that prevent breaking changes 
              from disrupting production systems.

              Each version in \`ArvoContract\` exists as a completely isolated definition. When 
              version 1.0.0 exists and version 1.1.0 is created, these are treated as entirely 
              separate contracts with no implicit compatibility between them. This isolation 
              provides absolute clarity about contract behavior and eliminates subtle 
              compatibility issues.

              ## Evolution Principles

              Contract evolution in Arvo follows a clear principle:

              - Create a new version for any breaking change that makes the contract more 
                restrictive or alters its restrictions
              - Handle non-breaking changes that maintain or reduce restrictions within the 
                existing version

              Understanding what constitutes a breaking change is essential for effective 
              contract evolution. The following guidelines provide comprehensive rules for 
              evolving contract schemas.

              ## Input Schema Evolution

              The following table defines breaking and non-breaking changes for the \`accepts\` 
              schema, which specifies the input events a service can receive:
              
              <br/>

              | Change Type           | Breaking Change? | Version Update | Explanation                                                             |
              | --------------------- | ---------------- | -------------- | ----------------------------------------------------------------------- |
              | Adding Required Field | Yes              | New Version    | Makes contract more restrictive by requiring additional data. Existing event producers cannot satisfy the new requirement without code changes, breaking their ability to communicate with the service. |
              | Adding Optional Field | No               | Same Version   | Maintains existing contract restrictions while allowing additional data. Existing producers can continue sending events without the optional field, while new producers can include it. The service must handle both cases. |
              | Adding Union Type     | No               | Same Version   | Increases permissiveness while preserving existing functionality. Adding \`string \| number\` where only \`string\` existed before allows more event types while still accepting all previously valid events. |
              | Removing Union Type   | Yes              | New Version    | Makes contract more restrictive by limiting allowed types. Producers sending the removed type will have their events rejected, breaking existing functionality and requiring producer code updates. |
              | Changing Field Type   | Yes              | New Version    | Changes nature of contract restrictions. Converting \`amount: number\` to \`amount: string\` breaks all existing producers that send numeric values, requiring widespread code changes across the system. |
              | Removing Any Field    | Limited Breaking | Same Version   | Following the tolerant reader pattern, removing fields from 'accepts' schema is not a breaking change. Clients can continue sending removed fields, while handlers simply ignore them. TypeScript's type safety ensures handlers don't accidentally reference removed fields during compilation. |

              <br/>

              ## Output Schema Evolution

              The following table defines breaking and non-breaking changes for the \`emits\` 
              schema, which specifies the output events a service can produce:

              <br/>

              | Change Type | Breaking Change? | Version Update | Explanation |
              |-------------|------------------|----------------|-------------|
              | Adding New Event Type | Non-Breaking | Same Version | Consumers ignore unrecognized event types by design. The new event type can be adopted incrementally without requiring coordinated deployment across the system. |
              | Removing Event Type | Breaking | New Version | Consumers dependent on this event type for their business logic will fail immediately. Removal requires consumers to refactor their handling logic before deployment. |
              | Adding Required Field | Limited Breaking | Special Case | Only the producing service requires modification to populate the new field. Consumers following the tolerant reader pattern continue functioning normally, though consumers with strict schema validation may require updates. |
              | Adding Optional Field | Non-Breaking | Same Version | Consumers adhering to the tolerant reader pattern ignore unknown fields automatically. New consumers can leverage the additional data while legacy consumers maintain full functionality. |
              | Expanding Union Type | Non-Breaking | Same Version | Consumers handle known values and safely ignore new additions. Adding \`'pending'\` to \`status: Enum('success','failed')\` maintains compatibility, though consumers may enhance functionality by handling the new state explicitly. |
              | Changing Field Type | Breaking | New Version | Alters fundamental data representation, breaking consumer parsing logic and data handling. Converting \`transaction_id: string\` to \`transaction_id: number\` invalidates existing validation rules, storage schemas, and business logic. |
              | Removing Union Value | Breaking | New Version | Breaks consumer logic explicitly handling the removed value in state machines or conditional flows. Removing \`'pending'\` from \`status: Enum('success','failed','pending')\` causes failures in consumers with pending-state logic. |
              | Removing Field | Breaking | New Version | Violates the established contract guarantee regardless of current usage. Any consumer depending on the removed field experiences immediate failure, requiring coordinated migration across all consumers. |


              <br/>
              <br/>
              

              ## Best practices for evolution

              Start contracts by modeling your existing working code rather than pursuing perfect
              upfront design. A good contract evolves from practical use rather than theoretical 
              perfection.

              Avoid two common anti-patterns in contract design.
              
              - Don't make everything optional to avoid breaking changes. This creates 
              loose contracts that provide little value and shift validation burden to consumers. 
              - Don't make everything required for maximum strictness. This prevents any 
              evolution without breaking changes and creates brittle systems.

              When adding capabilities that don't break existing consumers, such as optional 
              fields, new event types, or expanded enum values, these can be added to the 
              current version. The key test is whether existing consumers continue working 
              without modifications.

              Key implementation strategy for \`ArvoContract\` development and versioning is
              a following.

              - Start with minimal contracts
              - Add optional capabilities within versions when possible
              - Create new versions only for genuine breaking changes
              - Treat each version as its own contract
              - Use semantic versioning to signal magnitude of changes, not compatibility

              This versioning philosophy acknowledges that in distributed systems, clear 
              boundaries and explicit contracts are more valuable than complex compatibility 
              promises.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pt-0!`}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Learn More

              Continue exploring additional concepts to deepen your understanding of Arvo and 
              its ecosystem.
            `)}
          />
        </div>
      </ContentContainer>
      <PageNavigation
        previous={{
          heading: ArvoEventLearn.name,
          link: ArvoEventLearn.link,
          content: ArvoEventLearn.summary,
        }}
        next={{
          heading: ArvoEventFactoryLearn.name,
          link: ArvoEventFactoryLearn.link,
          content: ArvoEventFactoryLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
