import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

const label = 'inherit.subject.ts';
export const InheritSubject: DemoCodePanel = {
  heading: 'Inherit From A Subject',
  description: cleanString(`
    The method \`ArvoOrchestrationSubject.from()\`, enables subject chaining—a powerful 
    feature for maintaining context across complex workflows. This method allows creating 
    a new orchestration \`subject\` from an existing **parent \`subject\`**, preserving 
    the relationship between different process stages. By parsing the parent subject and 
    merging metadata, developers can create **child \`subjects\`** that inherit and extend 
    the context of their predecessors.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { ArvoOrchestrationSubject } from 'arvo-core'
import { v4 as uuid4 } from 'uuid'

// Create a parent subject
const parentSubject = ArvoOrchestrationSubject.new({
  orchestator: "parentProcess",
  version: "1.0.0",
  initiator: "systemA",
  meta: { environment: "production" }
});

// Create a new subject from the parent
const childSubject = ArvoOrchestrationSubject.from({
  orchestator: "childProcess",
  version: "2.0.0",
  subject: parentSubject,
  meta: { step: "processing" }  // Will be merged with parent's metadata
});


`,
    },
  ],
};
