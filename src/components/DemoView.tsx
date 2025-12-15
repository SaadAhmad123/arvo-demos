import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { Md3ContentPadding } from '../classNames';
import { Md3Buttons } from '../classNames/buttons';
import { Md3Cards } from '../classNames/cards';
import type { DemoCodePanel } from '../pages/types';
import { cleanString } from '../utils';
import CodeBlock from './CodeBlock';
import { ContentContainer } from './ContentContainer';
import { ReMark } from './ReMark';
import { Separator } from './Separator';

type DemoViewProps = {
  panels: DemoCodePanel[];
};

const CopyContentButton: React.FC<DemoViewProps> = ({ panels }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const contentToCopy = useMemo(() => {
    let content = '';
    for (const panel of panels) {
      content += '\n---\n';
      content += cleanString(`
                    # ${panel.heading}
                    
                    ${panel.description}

                    # Code Demo
                  `);
      for (const tab of panel.tabs) {
        content += `
\`\`\`${tab.lang}
// Filename: ${tab.title ?? 'unknown'} 
${tab.code}
\`\`\` 
                    `;
      }
      content += '\n---\n';
    }
    return content;
  }, [panels]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button type='button' className={Md3Buttons.filledTonalWithIcon} onClick={handleCopy}>
      {copied ? <LuCheck /> : <LuCopy />}
      <span>Copy Following Content</span>
    </button>
  );
};

export const DemoView: React.FC<DemoViewProps> = ({ panels }) => {
  return (
    <>
      <ContentContainer>
        <div>
          <div className={`flex items-center justify-center ${panels[0]?.singlePanel ? '' : 'mb-20'}`}>
            <CopyContentButton panels={panels} />
          </div>
          <div className='grid grid-cols-1 gap-4'>
            {panels.map((item, index) => {
              if (item.singlePanel) {
                return (
                  <React.Fragment key={index.toString()}>
                    <ContentContainer content>
                      <div className={`${Md3ContentPadding} pb-0!`}>
                        <ReMark content={`# ${item.heading}`} />
                        <Separator padding={8} />
                        <ReMark bodyTextSize='large' content={item.description} />
                      </div>
                      <Separator padding={8} />
                      <div className='px-0 pb-[32px] sm:p-[56px] pt-0!'>
                        <CodeBlock tabs={item.tabs} />
                      </div>
                    </ContentContainer>
                  </React.Fragment>
                );
              }
              return (
                <div
                  key={index.toString()}
                  className={`grid grid-cols-1 gap-4 ${item.singlePanel ? '' : 'xl:grid-cols-2'}`}
                >
                  <div className={Md3Cards.filled}>
                    <div className={Md3Cards.inner.content}>
                      <ReMark content={`# ${item.heading}`} />
                      <Separator padding={8} />
                      <ReMark content={item.description} />
                    </div>
                  </div>
                  <CodeBlock tabs={item.tabs} />
                </div>
              );
            })}
          </div>
        </div>
      </ContentContainer>
    </>
  );
};
