import type { VersionedArvoContract } from 'arvo-core';
import type { IMachineMemory } from 'arvo-event-handler';

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
export type AnyVersionedContract = VersionedArvoContract<any, any>;

export type Persistable = {
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  memory: IMachineMemory<Record<string, any>>;
};
