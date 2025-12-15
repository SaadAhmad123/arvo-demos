import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { EventHandlerFactory } from './CodeTabs/EventHandlerFactory';
import { ExecutingYourHandler } from './CodeTabs/ExecutingYourHandler';
import { FirstEventHandler } from './CodeTabs/FirstEventHandler';
import { ObservabilityAndLogging } from './CodeTabs/ObservabilityAndLogging';
import { ServiceEvolution } from './CodeTabs/ServiceEvolution';

export const Demo: React.FC = () => (
  <DemoView
    panels={[FirstEventHandler, ExecutingYourHandler, EventHandlerFactory, ServiceEvolution, ObservabilityAndLogging]}
  />
);
