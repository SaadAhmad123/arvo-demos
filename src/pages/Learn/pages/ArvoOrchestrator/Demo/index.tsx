import React from 'react';
import { Orchestrator } from './CodeTabs/Orchestrator';
import { FactoryPattern } from './CodeTabs/FactoryPattern';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => <DemoView panels={[Orchestrator, FactoryPattern]} />;
