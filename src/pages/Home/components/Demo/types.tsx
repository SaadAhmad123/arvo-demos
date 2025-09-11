import type { CodeBlockProps } from '../../../../components/CodeBlock';

export type DemoCodePanel = {
  heading: string;
  description: string;
  tabs: CodeBlockProps['tabs'][number][];
};
