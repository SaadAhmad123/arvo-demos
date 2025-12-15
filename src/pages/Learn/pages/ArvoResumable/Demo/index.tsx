import React from 'react';

import { DemoView } from '../../../../../components/DemoView';
import { Resumable } from './CodeTabs/Resumable';
import { ResumableContract } from './CodeTabs/ResumableContract';
import { Testing } from './CodeTabs/Testing';

export const Demo: React.FC = () => <DemoView panels={[ResumableContract, Resumable, Testing]} />;
