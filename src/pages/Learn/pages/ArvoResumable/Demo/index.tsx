import React from 'react';

import { DemoView } from '../../../../../components/DemoView';
import { ResumableContract } from './CodeTabs/ResumableContract';
import { Resumable } from './CodeTabs/Resumable';
import { Testing } from './CodeTabs/Testing';

export const Demo: React.FC = () => <DemoView panels={[ResumableContract, Resumable, Testing]} />;
