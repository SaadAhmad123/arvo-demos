import React from 'react';
import { ArvoEventOperations } from './CodeTabs/ArvoEventOperations';
import { ContractArvoEventTab } from './CodeTabs/ContractArvoEvent';
import { CreateArvoEventTab } from './CodeTabs/CreateArvoEvent';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => (
  <DemoView panels={[CreateArvoEventTab, ContractArvoEventTab, ArvoEventOperations]} />
);
