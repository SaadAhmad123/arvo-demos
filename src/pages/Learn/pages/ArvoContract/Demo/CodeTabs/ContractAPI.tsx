import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ContractAPI: DemoCodePanel = {
  singlePanel: true,
  heading: 'The Contract API',
  description: cleanString(`
    Once you've created an \`ArvoContract\` instance, you gain access to a comprehensive API that enables 
    contract introspection, and transformation. These utilities support critical 
    workflows including documentation generation, version management, schema export for external 
    systems, and runtime contract verification.

    The contract API provides methods for accessing version information, generating JSON Schema 
    representations compatible with standard tooling, and retrieving type-safe references to 
    specific contract versions. These capabilities prove essential when building developer tools, 
    generating API documentation, integrating with AI agents, or establishing interoperability 
    with non-TypeScript services.

    Understanding the contract API enables you to leverage contracts beyond their primary role 
    in event validation. You can programmatically inspect contract definitions, build automated 
    testing methods, generate OpenAPI specifications, or create service discovery mechanisms 
    that help systems understand available services and their interfaces at runtime.
  `),
  tabs: [
    {
      title: 'contract.api.ts',
      lang: 'ts',
      code: `
import { userRegistrationHandlerContract } from './contract';

// ============================================================================
// Version Management
// ============================================================================

/**
 * Retrieves all semantic versions defined in the contract.
 * Versions are sorted in ascending order (oldest to newest) when 'ASC' is specified.
 */
const sortedVersions = userRegistrationHandlerContract.getSortedVersionNumbers('ASC');
// Returns: ["1.0.0"]

/**
 * Access a specific contract version for targeted operations.
 * This provides a type-safe reference to a particular version's schema and metadata.
 */
const version_1_0_0 = userRegistrationHandlerContract.version('1.0.0');

// ============================================================================
// JSON Schema Generation
// ============================================================================

/**
 * Generates a complete JSON Schema representation of all contract versions.
 */
const fullContractSchema = userRegistrationHandlerContract.toJsonSchema();

/**
 * Generates JSON Schema for a specific contract version.
 */
const versionSpecificSchema = version_1_0_0.toJsonSchema();

// ============================================================================
// System Error Schema Access
// ============================================================================

/**
 * Accesses the auto-generated system error Zod schema.
 * System errors are automatically created for every contract following the naming pattern:
 * sys.{contract.type}.error (e.g., "sys.com.user.register.error")
 * 
 * This schema uses the reserved dataschema version "0.0.0" and is automatically included
 * in all contract versions, ensuring consistent error handling across your entire system.
 * Every contract operation can emit this standardized error type when exceptional
 * conditions occur during processing.
 */
const systemErrorSchema = userRegistrationHandlerContract.systemError;

// ============================================================================
// Direct Schema Access and Type Inference
// ============================================================================

/**
 * Direct access to the Zod schema for accepted input events.
 * This provides the raw schema object that can be used for runtime validation,
 * schema composition, or custom validation logic outside the contract system.
 */
const acceptSchema = version_1_0_0.accepts.schema;

/**
 * Infers the TypeScript type directly from the Zod schema.
 */
type DirectAcceptType = z.infer<typeof acceptSchema>;
// Resolves to:
// {
//     email: string;
//     username: string;
//     password: string;
// }

// ============================================================================
// Comprehensive Type Information
// ============================================================================

/**
 * Extracts complete type information for a specific contract version.
 * The InferVersionedArvoContract utility type provides structured access to all
 * type definitions within the contract, including accepts, emits, and systemError types.
 * This is the recommended approach for comprehensive type safety in your application.
 */
type ContractType = InferVersionedArvoContract<typeof version_1_0_0>;

// ============================================================================
// Accept Event Types
// ============================================================================

/**
 * Extracts the event type string for accepted input events.
 */
type AcceptEventType = ContractType['accepts']['type'];
// Resolves to: "com.user.register"

/**
 * Extracts the data payload type for accepted input events.
 */
type AcceptDataType = ContractType['accepts']['data'];
// Resolves to:
// {
//     email: string;
//     username: string;
//     password: string;
// }

// ============================================================================
// Emit Event Types
// ============================================================================

/**
 * Extracts the event type string for a specific success emission.
 */
type SuccessEventType = ContractType['emits']['evt.user.registered']['type'];
// Resolves to: "evt.user.registered"

/**
 * Extracts the data payload type for a specific success emission.
 */
type SuccessDataType = ContractType['emits']['evt.user.registered']['data'];
// Resolves to:
// {
//     email: string;
//     username: string;
//     user_id: string;
//     created_at: string;
// }

// ============================================================================
// System Error Types
// ============================================================================

/**
 * Extracts the event type string for system errors.
 * All system errors follow the pattern "sys.{contract.type}.error",
 * providing a predictable error event type across your entire system.
 */
type SystemErrorType = ContractType['systemError']['type'];
// Resolves to: "sys.com.user.register.error"

/**
 * Extracts the data payload type for system errors.
 * System errors use the standardized ArvoErrorType structure, ensuring
 * consistent error reporting and handling across all contracts and services.
 * This structure includes the error name, descriptive message, and optional stack trace.
 */
type SystemErrorData = ContractType['systemError']['data'];
// Resolves to: ArvoErrorType
// {
//   errorName: string;        // Identifies the specific error type (e.g., "ValidationError")
//   errorMessage: string;      // Human-readable description of what went wrong
//   errorStack: string | null; // Stack trace for debugging (null in production for security)
// }
`,
    },
  ],
};
