import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const SimpleArvoContract: DemoCodePanel = {
  heading: 'Creating Simple Contracts',
  description: cleanString(`
    While \`createArvoContract\` provides complete flexibility for complex service interfaces, 
    many services follow straightforward request-response patterns. The \`createSimpleArvoContract\` 
    factory streamlines contract creation for these common scenarios by applying opinionated 
    conventions while maintaining full type safety and validation capabilities.

    The simple contract factory automatically structures your contract with standardized event 
    type patterns, eliminating boilerplate while ensuring consistency across your system. Rather 
    than explicitly defining multiple emit types, you specify a single success schema, and the 
    factory handles event type generation according to established conventions.

    **Convention patterns applied by the simple contract factory:**

    - The accepts event type follows the pattern \`com.{type}\`, establishing the service entry point. 
    - The success emit type follows \`evt.{type}.success\`, providing a consistent success signal 
    across services. 
    - The system error type, automatically included in all contracts, follows 
    \`sys.com.{type}.error\` for standardized error handling.
    
    The **created contracts remain complete \`ArvoContract\` instances** with access to the full contract 
    API. The only difference lies in their creation method—the simple factory enforces conventions 
    that the base factory leaves open for customization. This approach works exceptionally well 
    for services with binary success-or-error outcomes, such as payment processing, data validation, 
    or external API integrations.
    
  `),
  tabs: [
    {
      title: 'contract.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import { z } from 'zod';

// Create a simple contract for payment processing with automatic event type generation
export const paymentContract = createSimpleArvoContract({
  uri: '#/services/payment/process',
  
  // The base type that drives all event type generation
  type: 'payment.process',
  
  description: 'Processes payment transactions with multiple payment methods',
  
  versions: {
    '1.0.0': {
      // Input schema - automatically receives type 'com.payment.process'
      accepts: z.object({
        amount: z.number().positive('Amount must be greater than zero'),
        currency: z.string().length(3, 'Currency must be ISO 4217 code'),
        payment_method: z.enum(['card', 'bank_transfer', 'crypto']),
        customer_id: z.string().uuid('Customer ID must be valid UUID'),
      }),
      
      // Success schema - automatically receives type 'evt.payment.process.success'
      // Note: Unlike createArvoContract where 'emits' is an object of multiple events,
      // here you define a single success case schema
      emits: z.object({
        transaction_id: z.string().uuid(),
        status: z.enum(['completed', 'pending']),
        timestamp: z.string().datetime(),
        confirmation_code: z.string(),
      }),
    },
  },
});

// The simple contract factory automatically generates these event types:
// - Accepts type: 'com.payment.process'
// - Success emit type: 'evt.payment.process.success'  
// - System error type: 'sys.com.payment.process.error'
      `,
    },
  ],
};
