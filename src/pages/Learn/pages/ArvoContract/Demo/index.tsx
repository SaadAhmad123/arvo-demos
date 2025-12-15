import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { ContractAPI } from './CodeTabs/ContractAPI';
import { FirstArvoContract } from './CodeTabs/FirstArvoContract';
import { OrchestratorContract } from './CodeTabs/OrchestratorContract';
import { SimpleArvoContract } from './CodeTabs/SimpleArvoContract';

export const Demo: React.FC = () => (
  <DemoView panels={[FirstArvoContract, ContractAPI, SimpleArvoContract, OrchestratorContract]} />
);
