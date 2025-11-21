import React from 'react';
import { ContextSetup } from './CodeTabs/ContextSetup';
import { HumanApprovalContract } from './CodeTabs/HumanApprovalContract';
import { OrchestratorContract } from './CodeTabs/OrchestratorContract';
import { StateMachine } from './CodeTabs/StateMachine';
import { Orchestrator } from './CodeTabs/Orchestrator';
import { Testing } from './CodeTabs/Testing';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => (
  <DemoView panels={[ContextSetup, HumanApprovalContract, OrchestratorContract, StateMachine, Orchestrator, Testing]} />
);
