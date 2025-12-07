import React from 'react';

import { DemoView } from '../../../../../components/DemoView';
import { ResumableContract } from './CodeTabs/ResumableContract';

export const Demo: React.FC = () => <DemoView panels={[ResumableContract]} />;
