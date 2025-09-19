import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

const label = 'new.subject.ts';
export const NewSubject: DemoCodePanel = {
  heading: 'Create New Subject',
  description: cleanString(`
    You can construct a new \`subject\` with comprehensive details using the
    \`ArvoOrchestrationSubject.new()\` method. This approach allows for creating a \`subject\` 
    with essential information such as the orchestrator name, version, initiator address, 
    and optional metadata. The method supports adding contextual information like environment
    details or unique stream topics, providing flexibility in \`subject\` creation.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { ArvoOrchestrationSubject } from 'arvo-core'
import { v4 as uuid4 } from 'uuid'

const subject = ArvoOrchestrationSubject.new({
  orchestator: "arvo.orc.order.create", // The orchestrator name
  version: "1.0.0",                     // The version of the orchestrator
  initiator: "test.test.test",           // The initiator address
});

// With metadata
const subjectWithMeta = ArvoOrchestrationSubject.new({
  orchestator: "arvo.orc.order.create",
  version: "1.0.0",
  initiator: "test.test.test",
  meta: {
    environment: "production",
    /**
     * [Optional] Maybe stream topic to publish all streaming events for an 
     * execution. Each execution may have a unique topic or not. Depends on 
     * the particular implementation
     */  
    stream_topic: uuid4(),              
  }
});


`,
    },
  ],
};
