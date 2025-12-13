import React from 'react';
import { PreparingDependencies } from './CodeTabs/PerparingDependencies';
import { SettingUpArvoAgentic } from './CodeTabs/SettingUpArvoAgentic';
import { DemoView } from '../../../../../components/DemoView';
import { ExecutingFirstAgent } from './CodeTabs/ExecutingFirstAgent';
import { AddingSimpleTools } from './CodeTabs/AddingSimpleTools';

export const Demo: React.FC = () => (
  <DemoView panels={[PreparingDependencies, SettingUpArvoAgentic, ExecutingFirstAgent, AddingSimpleTools]} />
);
