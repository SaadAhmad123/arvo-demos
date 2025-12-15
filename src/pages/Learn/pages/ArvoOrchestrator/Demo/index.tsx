import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { FactoryPattern } from './CodeTabs/FactoryPattern';
import { Orchestrator } from './CodeTabs/Orchestrator';

export const Demo: React.FC = () => <DemoView panels={[Orchestrator, FactoryPattern]} />;
