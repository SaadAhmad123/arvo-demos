import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { ContextSetup } from './CodeTabs/ContextSetup';
import { HumanApprovalContract } from './CodeTabs/HumanApprovalContract';
import { Orchestrator } from './CodeTabs/Orchestrator';
import { OrchestratorContract } from './CodeTabs/OrchestratorContract';
import { StateMachine } from './CodeTabs/StateMachine';
import { Testing } from './CodeTabs/Testing';

export const Demo: React.FC = () => (
  <DemoView panels={[ContextSetup, HumanApprovalContract, OrchestratorContract, StateMachine, Orchestrator, Testing]} />
);
