import React from 'react';
import { ContentContainer } from './ContentContainer';
import type { DemoCodePanel } from '../pages/types';
import { Md3ContentPadding } from '../classNames';
import { Separator } from './Separator';
import { ReMark } from './ReMark';
import CodeBlock from './CodeBlock';
import { Md3Cards } from '../classNames/cards';

type DemoViewProps = {
  panels: DemoCodePanel[];
};

export const DemoView: React.FC<DemoViewProps> = ({ panels }) => {
  return (
    <>
      <ContentContainer>
        <div>
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
