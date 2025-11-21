import React from 'react';
import { CreatingAgents } from './CodeTabs/CreatingAgents';
import { Integration } from './CodeTabs/Integration';
import { LLMIntegrations } from './CodeTabs/LLMIntegrations';
import { MCPIntegration } from './CodeTabs/MCPIntegration';
import { PreparingDependencies } from './CodeTabs/PerparingDependencies';
import { SettingUpArvoAgentic } from './CodeTabs/SettingUpArvoAgentic';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => (
  <DemoView
    panels={[PreparingDependencies, SettingUpArvoAgentic, LLMIntegrations, MCPIntegration, CreatingAgents, Integration]}
  />
);
