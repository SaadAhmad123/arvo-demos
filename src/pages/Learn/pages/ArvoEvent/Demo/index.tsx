import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { ArvoEventOperations } from './CodeTabs/ArvoEventOperations';
import { ContractArvoEventTab } from './CodeTabs/ContractArvoEvent';
import { CreateArvoEventTab } from './CodeTabs/CreateArvoEvent';

export const Demo: React.FC = () => (
  <DemoView panels={[CreateArvoEventTab, ContractArvoEventTab, ArvoEventOperations]} />
);
