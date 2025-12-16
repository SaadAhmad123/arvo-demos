import { ArvoEventFactoryLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ExecutingFirstAgent: DemoCodePanel = {
  heading: 'Executing the Agent',
  description: cleanString(`
    Executing your agent is straightforward. You don't need complex event brokers or production-grade 
    memory backends to get started. Arvo provides in-memory implementations for both out of the box, 
    perfect for development, testing, and small-scale deployments. You can always provide 
    your own implementations tailored to your infrastructure without changing any agent code.

    To execute an agent, create a valid event and call the \`.execute\` method. We build the event using 
    \`createArvoEventFactory\`, which is the recommended Arvo approach. You can learn more about event 
    factories in the [${ArvoEventFactoryLearn.name.toLowerCase()}](${ArvoEventFactoryLearn.link}) documentation.

    ### This Is A Production-Ready Agent

    Defining your first agent might feel like some ceremony for simple functionality, but what you 
    gain becomes clear as you build more complex systems. **The design of \`ArvoAgent\` deliberately does 
    not optimize for simple agent implementations. It's designed to make complex agents and agentic systems 
    accessible to develop, grow naturally as your needs expand, and remain maintainable as your system 
    evolves over months and years**.

    The contract system ensures type safety across your entire application and enables independent evolution 
    of different agent versions. The factory pattern means you can test with in-memory storage and deploy 
    with Redis without changing agent code. The memory backend automatically handles state persistence across 
    suspends and resumes, so your agent can participate in workflows lasting hours or days. The versioning 
    system lets you deploy new prompts, switch models, or change output formats without coordinating updates 
    across your entire system.

    What looks like boilerplate is actually infrastructure that scales from prototype to production. It handles 
    concerns like observability, error recovery, and distributed coordination that you'd otherwise build yourself, 
    piece by piece, as your system grows.
  `),
  tabs: [
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { simpleAgent, simpleAgentContract } from './handlers/simple.agent.ts';
import { createArvoEventFactory } from 'arvo-core';

async function main() {
  // Create the initialization event for the agent
  const event = createArvoEventFactory(simpleAgentContract.version('1.0.0'))
    .accepts({
      source: 'test.test.test',
      data: {
        parentSubject$$: null,  // Arvo's convention for root orchestration events
        message: 'Hello, what are you?',
      },
    });

  // Build the agent via the factory and execute it
  const { events } = await simpleAgent().execute(event);
  
  // Arvo event handlers always return a list of events
  for (const evt of events) {
    console.log(evt.toString(2));
  }
}

main();

/*
  Example output - the agent's completion event:
  
  Console log [0]
  {
    "id": "08c41521-cfab-4b73-bcfe-676643ab5b80",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jtEKwyAMRf8lz1UUOxj9m2jTLVB1aFoGxX9f2GAv9yEnnHsvqC09qUtDqQ2WCwpmggWwndUqs/igIrZzfu0EE5zUOteiH94662BMQG9Kh3yPF/CqKISNQkpkItJm5ptzJs4bGUy43kOMPvpZXVxY+NcLohvsPxSuNSOrshz7riWZBNU/xgfGTDsl",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "Hello! I'm an AI language model created by OpenAI. I'm here to assist you with information, answer questions, and help with a wide range of topics. How can I assist you today?"
    },
    "time": "2025-12-13T20:03:48.808+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 61,
    "traceparent": null,
    "tracestate": null,
    "parentid": "09256b08-3c79-40a3-b87a-9c76dad86099",
    "domain": null
  }
*/
      `,
    },
  ],
};
