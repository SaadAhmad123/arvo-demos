import React from 'react';
import { InheritSubject } from './CodeTabs/InheritSubject';
import { NewSubject } from './CodeTabs/NewSubject';
import { DemoView } from '../../../../../components/DemoView';

export const Demo: React.FC = () => <DemoView panels={[NewSubject, InheritSubject]} />;
