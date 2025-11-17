import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const OrchestratorContract: DemoCodePanel = {
  singlePanel: true,
  heading: 'The Orchestrator Contract',
  description: cleanString(`
    Orchestrators in Arvo are essentially virtual coordinators that function as special
    event handlers which react to more than one kind of event. Since all event handlers 
    in Arvo require contracts, orchestrators do too. This contract is then passed to 
    \`ArvoMachine\` which binds to it, providing intellisense and compile-time and run-time type
    safety.

    As mentioned in the \`ArvoContract\` documentation, to facilitate nested orchestration 
    patterns in Arvo the special \`parentSubject$$\` field must be injected. Arvo provides a 
    factory function called \`createArvoOrchestratorContract\` to improve developer quality of 
    life. You can read more about this in the \`ArvoContract\` documentation. Here the same 
    function is used to implement the orchestrator contract which will then be bound to 
    the machine definition.
 `),
  tabs: [
    {
      title: 'orchestrator.demo/contract.ts',
      lang: 'ts',
      code: `
import { ArvoErrorSchema, cleanString, createArvoOrchestratorContract } from 'arvo-core';
import z from 'zod';

export const demoOrchestratorContract = createArvoOrchestratorContract({
  uri: '#/org/amas/orchestrator/demo',
  name: 'demo',      
  // - the resultant init event type will be 'arvo.orc.demo', 
  // - the complete event type will be 'arvo.orc.demo.done', and
  // - the system error event type will be 'sys.arvo.orc.demo.error'
  description: cleanString(\`
    A demo orchestrator which shows how an orchestrator can works in Arvo.
        
    - It takes a number set of numbers.
    - It asks of users permission to execute the handlers
    - It, in parrallel, emits event to add and multiply the numbers
    - It returns the product of the numbers, sum of the numbers and result of sum divided by product
        
    This demonstrates, by a very simple example, the machine declaration 
    and execution in Arvo. 
  \`)
  versions: {
    '1.0.0': {
      init: z.object({
        values: z.number().array(),
      }),
      complete: z.object({
        success: z.boolean(),
        errors: ArvoErrorSchema.array().nullable(),
        product: z.number().nullable(),
        sum: z.number().nullable(),
        result: z.number().nullable(),
      }),
    },
  },
});
     
     `,
    },
  ],
};
