import React from 'react';
import { DemoView } from '../../../../../components/DemoView';
import { InheritSubject } from './CodeTabs/InheritSubject';
import { NewSubject } from './CodeTabs/NewSubject';

export const Demo: React.FC = () => <DemoView panels={[NewSubject, InheritSubject]} />;
