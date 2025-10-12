import { ArvoContractLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ServiceEvolution: DemoCodePanel = {
  singlePanel: true,
  heading: 'Managing Service Evolution Through Contracts',
  description: cleanString(`
    As detailed in the [\`ArvoContract\`](${ArvoContractLearn.link}) documentation, 
    Arvo treats service evolution as a first-class concern across all event handler 
    primitives. The \`ArvoEventHandler\` treats each contract version as a completely 
    independent entity, both functionally and semantically, reflecting Arvo's fundamental 
    philosophy about how services should evolve in distributed systems while maintaining 
    clarity and reliability.

    ## A Practical Example

    Consider a practical scenario where a new consumer of your user creation handler 
    requires date of birth instead of age. Rather than modifying the existing implementation 
    and potentially breaking current consumers, you can introduce a new contract version 
    that accepts the required format while maintaining the original version for existing clients.

    Rather than duplicating business logic, you can maintain core functionality while 
    adding version-specific transformations. This example demonstrates how the \`createUser\` 
    function remains unchanged while a new helper function handles the date of birth 
    conversion. The isolation between version handlers is intentional—each version evolves 
    independently while preserving service contract integrity.

    ## Benefits of Version Isolation

    This pattern enables you to onboard new consumers with different requirements without 
    disrupting existing functionality, provides flexibility to implement sunset strategies 
    based on business needs rather than technical limitations, and proves particularly 
    valuable in large-scale systems where the cost of breaking changes far outweighs the 
    cost of maintaining version-specific handlers. The increase in code volume is 
    a conscious trade-off chosen to prioritize system reliability and safe evolution over 
    code conciseness.

    ### Verbosity for Reliability

    While this approach increases code verbosity, Arvo contends that this trade-off 
    eliminates significant sources of technical debt by removing implicit coupling 
    between handler versions. Each version can implement distinct business logic, manage 
    its own lifecycle, and execute deprecation strategies according to business needs, 
    all while ensuring complete backward compatibility.
  `),
  tabs: [
    {
      title: 'create.user.handler.ts',
      lang: 'ts',
      code: `
import { createArvoContract, type ArvoEvent } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import z from 'zod';

/**
 * Multi-version contract demonstrating service evolution.
 * 
 * Version 1.0.0: Accepts age as a number
 * Version 2.0.0: Accepts date of birth as a string
 * 
 * Both versions emit identical success events, maintaining output consistency
 * while allowing input format evolution for new consumers.
 */
export const userCreateContract = createArvoContract({
    uri: "#/sample/user/create",
    type: "com.create.user",
    versions: {
        "1.0.0": {
            accepts: z.object({
                name: z.string(),
                age: z.number(),                // Direct age input
            }),
            emits: {
                "evt.create.user.success": z.object({
                    created: z.boolean()
                })
            }
        },
        "2.0.0": {
            accepts: z.object({
                name: z.string(),
                dob: z.string(),                // Date of birth input (ISO format expected)
            }),
            emits: {
                "evt.create.user.success": z.object({
                    created: z.boolean()
                })
            }
        }
    }
});

/**
 * Core business logic shared across all versions.
 * 
 * By keeping business logic separate from version-specific transformations,
 * we maintain a single source of truth while allowing input format variations.
 */
const createUser = (name: string, age: number): boolean => {
    // Simulate user creation in database
    // Business rules remain consistent across versions
    return true;
};

/**
 * Version 2.0.0 specific helper: converts date of birth to age.
 * 
 * This transformation allows v2.0.0 to accept DOB while maintaining
 * compatibility with the core createUser function that expects age.
 */
const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

/**
 * User creation handler supporting multiple contract versions.
 * 
 * Each version handler is completely independent:
 * - Version 1.0.0: Direct pass-through of age
 * - Version 2.0.0: Converts DOB to age before processing
 * 
 * This isolation enables:
 * - Independent version evolution
 * - Version-specific optimizations (note different executionunits)
 * - Clear deprecation paths when needed
 */
export const createUserHandler: EventHandlerFactory = () => createArvoEventHandler({
    contract: userCreateContract,
    executionunits: 1,                      // Default base cost
    handler: {
        // Version 1.0.0: Original implementation accepting age directly
        '1.0.0': async ({event}) => {
            const userCreated = createUser(
                event.data.name,
                event.data.age              // Age provided directly
            );
            
            return {
                type: 'evt.create.user.success',
                data: { created: userCreated }
            };
        },
        
        // Version 2.0.0: New implementation accepting date of birth
        '2.0.0': async ({event}) => {
            // Transform DOB to age for compatibility with core logic
            const age = calculateAge(event.data.dob);
            
            const userCreated = createUser(
                event.data.name,
                age                         // Age calculated from DOB
            );
            
            return {
                type: 'evt.create.user.success',
                data: { created: userCreated },
                // Higher cost reflects additional date calculation overhead
                executionunits: 2,
            };
        }
    }
});

 
`,
    },
  ],
};
