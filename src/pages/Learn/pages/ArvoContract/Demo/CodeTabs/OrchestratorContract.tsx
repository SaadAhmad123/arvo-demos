import {
  ArvoEventDataFieldDeepDiveLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const OrchestratorContract: DemoCodePanel = {
  heading: 'Creating Contracts for Orchestrators',
  description: cleanString(`
    Orchestrators in Arvo ([\`ArvoOrchestrator\`](${ArvoOrchestratorLearn.link}) and 
    [\`ArvoResumable\`](${ArvoResumableLearn.link})) represent specialized event handlers 
    that coordinate complex workflows by triggering other handlers through event emission. 
    Beyond their internal processing logic, orchestrators manage distributed execution flows 
    and maintain workflow state across service boundaries. Detailed orchestrator concepts 
    and implementation patterns are explored in their respective documentation pages.
    
    ## Hierarchical Orchestrations

    Each orchestrator execution maintains a unique identity through its event 
    [\`subject\`](${ArvoEventDataFieldDeepDiveLearn.link}). Hierarchical coordination between 
    orchestrators relies on the \`parentSubject$$\` field to establish execution context 
    relationships. Root orchestrators initialize with \`parentSubject$$\` set to \`null\`, 
    while child orchestrators receive their parent's subject as their \`parentSubject$$\` value.

    Upon completion, an orchestrator determines its completion event's \`subject\` based on 
    the \`parentSubject$$\` received during initialization. Root executions use their own 
    subject for completion events, while child executions use the \`parentSubject$$\` value, 
    effectively returning control to the parent orchestrator and maintaining proper workflow 
    hierarchy.

    The \`createArvoOrchestratorContract\` factory streamlines orchestrator contract creation 
    by automatically incorporating all required configuration patterns common across Arvo 
    orchestrators, including the critical \`parentSubject$$\` field injection. The factory 
    produces a complete \`ArvoContract\` instance with full API access, providing the same 
    introspection, validation, and transformation capabilities available to all contracts.

    **Convention patterns applied by the orchestrator contract factory:**

    The factory generates consistent event types following these conventions:
    
    - The initialization event type follows \`arvo.orc.{name}\` and automatically injects the \`parentSubject$$\` 
    field into the init event data schema. 
    - The completion event type follows \`arvo.orc.{name}.done\`. 
    - The system error type follows \`sys.arvo.orc.{name}.error\` through the underlying \`ArvoContract\` generation process.
  `),
  tabs: [
    {
      title: 'contract.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract, ArvoErrorSchema, type InferVersionedArvoContract } from 'arvo-core';
import { z } from 'zod';

// Helper for creating consistent completion schemas (if needed. Mostly you don't need to do it)
export const createOrchestratorCompletionSchema = <T extends z.AnyZodObject>(schema: T) => {
  return z.object({
    status: z.enum(['success', 'error']),
    errors: ArvoErrorSchema.array().nullable(),
    result: schema.nullable(),
  });
};

// Define the orchestrator contract
export const orderFulfillmentOrchestrator = createArvoOrchestratorContract({
  uri: '#/orchestrators/order/fulfillment',
  name: 'order.fulfillment',
  versions: {
    '1.0.0': {
      // Initial event schema - The \`parentSubject$$\` field is automatically
      // injected by the factory
      init: z.object({
        order_id: z.string(),
        items: z.array(
          z.object({
            product_id: z.string(),
            quantity: z.number(),
          }),
        ),
        shipping_address: z.string(),
      }),

      // Completion event schema
      complete: createOrchestratorCompletionSchema(
        z.object({
          order_id: z.string(),
          fulfillment_status: z.enum(['shipped', 'cancelled']),
          tracking_number: z.string().optional(),
          shipment_date: z.string().datetime().optional(),
        }),
      ),
    },
  },
});

// The contract factory automatically generates these event types:
// - Accepts/ Init event type: 'arvo.orc.order.fulfillment'
// - Success emit/ Completion event type: 'arvo.orc.order.fulfillment.done'
// - System error type: 'sys.arvo.orc.order.fulfillment.error'

// Despite using the orchestrator-specific factory, this remains a full ArvoContract
// instance with complete API access:
const versions = orderFulfillmentOrchestrator.getSortedVersionNumbers('ASC');
const jsonSchema = orderFulfillmentOrchestrator.toJsonSchema();
const specificVersion = orderFulfillmentOrchestrator.version('1.0.0');

// The Typescript typing API:
const version1 = orderFulfillmentOrchestrator.version('1.0.0');
type ContractType = InferVersionedArvoContract<typeof version1>;

// Get initialization event types
type InitType = ContractType['accepts']['type'];
// Resolves to: 'arvo.orc.order.fulfillment'

type InitDataType = ContractType['accepts']['data'];
// Full initialization data structure with parentSubject$$
// Resolves to:
// {
//     order_id: string;
//     items: {
//         product_id: string;
//         quantity: number;
//     }[];
//     shipping_address: string;
//     parentSubject$$: string | null;
// }

// Get completion event types
type CompleteType = ContractType['emits'][ContractType['metadata']['completeEventType']]['type'];
// Resolves to:
// 'arvo.orc.order.fulfillment.done'

type CompleteDataType = ContractType['emits'][ContractType['metadata']['completeEventType']]['data'];
// Resolves to:
// {
//     status: "success" | "error";
//     errors: {
//         errorName: string;
//         errorMessage: string;
//         errorStack: string | null;
//     }[] | null;
//     result: {
//         order_id: string;
//         fulfillment_status: "shipped" | "cancelled";
//         tracking_number?: string | undefined;
//         shipment_date?: string | undefined;
//     } | null;
// }


 
      `,
    },
  ],
};
