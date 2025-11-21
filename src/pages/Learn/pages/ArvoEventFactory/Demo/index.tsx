import React from 'react';
import { CreatingEvents } from './CodeTabs/CreatingEvents';
import { DataValidation } from './CodeTabs/DataValidation';
import { UnderstandingEventFactory } from './CodeTabs/UnderstandingEventFactory';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => <DemoView panels={[UnderstandingEventFactory, CreatingEvents, DataValidation]} />;
