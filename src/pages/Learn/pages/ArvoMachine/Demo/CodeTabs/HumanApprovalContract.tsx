import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const HumanApprovalContract: DemoCodePanel = {
  heading: 'The Human Approval Contract',
  description: cleanString(`
    The human approval step demonstrates how Arvo handles external interactions that 
    cannot remain within the standard event broker flow (the default event fabric). 

    In Arvo's model, humans are also simply another type of event handler. They receive events 
    through some interface and provide responses which get deliver to the event fabric via some
    software mechanism. This perspective means the only requirement is routing events to software 
    that can facilitate human interaction. While you could implement a dedicated event handler 
    within the fabric that manages human communication and emits responses, that approach often 
    introduces unnecessary complexity for simple scenarios. 

    This tutorial uses a more pragmatic pattern. The human becomes the event handler, and the 
    system provides a contract defining the human approval interface. This contract enables reliable 
    data exchange between system and human. The contract is registered as a service in the machine 
    definition, allowing the state machine to emit events that external software can capture 
    and present to humans through appropriate interfaces.

    The contract itself defines the domain field as 'human.interaction', which is one method 
    for domain specification. However, domain assignment alone does not automatically apply to events. 
    During event emission, the machine must explicitly flag (through a symbolic mechanism provided by 
    Arvo) that it should inherit the domain from  the contract definition. This explicit opt-in 
    ensures developers remain aware of cross-domain interactions and prevents accidental domain leakage.

    This pattern scales beyond human interaction. Any external integration requiring custom routing or 
    specialized handling can use the same domain-based event capture mechanism. The tutorial 
    demonstrates this flexibility while keeping the implementation straightforward.
  `),
  tabs: [
    {
      title: 'human.approval.contract.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import z from 'zod';

export const humanApprovalContract = createSimpleArvoContract({
  uri: '#/org/amas/external/human_approval',
  type: 'human.approval',
  domain: 'human.interaction',
  description: 'This is a service which gets approval from the human based on the provided prompt',
  versions: {
    '1.0.0': {
      accepts: z.object({
        prompt: z.string(),
      }),
      emits: z.object({
        approval: z.boolean(),
      }),
    },
  },
});
      
      `,
    },
  ],
};
