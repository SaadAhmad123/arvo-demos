import React from 'react';
import { ContractAPI } from './CodeTabs/ContractAPI';
import { FirstArvoContract } from './CodeTabs/FirstArvoContract';
import { OrchestratorContract } from './CodeTabs/OrchestratorContract';
import { SimpleArvoContract } from './CodeTabs/SimpleArvoContract';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => (
  <DemoView panels={[FirstArvoContract, ContractAPI, SimpleArvoContract, OrchestratorContract]} />
);
