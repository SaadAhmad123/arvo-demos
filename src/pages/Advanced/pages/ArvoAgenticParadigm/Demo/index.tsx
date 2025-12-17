import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { AddingEventDrivenService } from './CodeTabs/AddingEventDrivenService';
import { AddingMcpServer } from './CodeTabs/AddingMcpServer';
import { AddingPermissionManager } from './CodeTabs/AddingPermissionManager';
import { AddingSimpleTools } from './CodeTabs/AddingSimpleTools';
import { ExecutingFirstAgent } from './CodeTabs/ExecutingFirstAgent';
import { PreparingDependencies } from './CodeTabs/PerparingDependencies';
import { SettingUpArvoAgentic } from './CodeTabs/SettingUpArvoAgentic';
import { MutliAgentSystem } from './CodeTabs/MutliAgentSystem';
import { HumanCollaboration } from './CodeTabs/AddingHumanInLoop';
import { AddingWorkflow } from './CodeTabs/AddingWorkflow';
import { ComposingAgentsWorkflows } from './CodeTabs/ComposingAgentsWorkflows';

export const Demo: React.FC = () => (
  <DemoView
    panels={[
      PreparingDependencies,
      SettingUpArvoAgentic,
      ExecutingFirstAgent,
      AddingSimpleTools,
      AddingMcpServer,
      AddingPermissionManager,
      AddingEventDrivenService,
      MutliAgentSystem,
      HumanCollaboration,
      AddingWorkflow,
      ComposingAgentsWorkflows,
    ]}
  />
);
