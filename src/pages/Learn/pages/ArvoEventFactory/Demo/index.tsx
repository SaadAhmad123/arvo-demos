import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { CreatingEvents } from './CodeTabs/CreatingEvents';
import { DataValidation } from './CodeTabs/DataValidation';
import { UnderstandingEventFactory } from './CodeTabs/UnderstandingEventFactory';

export const Demo: React.FC = () => <DemoView panels={[UnderstandingEventFactory, CreatingEvents, DataValidation]} />;
