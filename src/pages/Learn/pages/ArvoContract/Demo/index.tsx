import React from 'react';
import { Md3ContentPadding } from '../../../../../classNames';
import { Md3Cards } from '../../../../../classNames/cards';
import { Md3Typography } from '../../../../../classNames/typography';
import CodeBlock from '../../../../../components/CodeBlock';
import { ContentContainer } from '../../../../../components/ContentContainer';
import { ReMark } from '../../../../../components/ReMark';
import { Separator } from '../../../../../components/Separator';
import { ContractAPI } from './CodeTabs/ContractAPI';
import { FirstArvoContract } from './CodeTabs/FirstArvoContract';
import { OrchestratorContract } from './CodeTabs/OrchestratorContract';
import { SimpleArvoContract } from './CodeTabs/SimpleArvoContract';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer>
        <div>
          <div className='grid grid-cols-1 gap-4'>
            {[FirstArvoContract, ContractAPI, SimpleArvoContract, OrchestratorContract].map((item, index) => {
              if (item.singlePanel) {
                return (
                  <React.Fragment key={index.toString()}>
                    <ContentContainer content>
                      <div className={`${Md3ContentPadding} pb-0!`}>
                        <h2 className={Md3Typography.headline.large}>{item.heading}</h2>
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
                      <h2 className={Md3Typography.headline.large}>{item.heading}</h2>
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
