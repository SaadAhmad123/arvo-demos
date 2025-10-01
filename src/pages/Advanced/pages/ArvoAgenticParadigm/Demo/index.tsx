import React from 'react';
import { Md3Typography } from '../../../../../classNames/typography';
import { ContentContainer } from '../../../../../components/ContentContainer';
import { Separator } from '../../../../../components/Separator';
import { Md3Cards } from '../../../../../classNames/cards';
import { ReMark } from '../../../../../components/ReMark';
import CodeBlock from '../../../../../components/CodeBlock';
import { SettingUpArvoAgentic } from './CodeTabs/SettingUpArvoAgentic';
import { PreparingDependencies } from './CodeTabs/PerparingDependencies';
import { LLMIntegrations } from './CodeTabs/LLMIntegrations';
import { CreatingAgents } from './CodeTabs/CreatingAgents';
import { Integration } from './CodeTabs/Integration';
import { MCPIntegration } from './CodeTabs/MCPIntegration';
import { Md3ContentPadding } from '../../../../../classNames';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer>
        <div>
          <div className='grid grid-cols-1 gap-4'>
            {[
              PreparingDependencies,
              SettingUpArvoAgentic,
              LLMIntegrations,
              MCPIntegration,
              CreatingAgents,
              Integration,
            ].map((item, index) => {
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
