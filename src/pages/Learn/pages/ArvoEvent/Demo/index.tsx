import React from 'react';
import { Md3Typography } from '../../../../../classNames/typography';
import { ContentContainer } from '../../../../../components/ContentContainer';
import { Separator } from '../../../../../components/Separator';
import { CreateArvoEventTab } from './CodeTabs/CreateArvoEvent';
import { Md3Cards } from '../../../../../classNames/cards';
import { ReMark } from '../../../../../components/ReMark';
import CodeBlock from '../../../../../components/CodeBlock';
import { ContractArvoEventTab } from './CodeTabs/ContractArvoEvent';
import { ArvoEventOperations } from './CodeTabs/ArvoEventOperations';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {[CreateArvoEventTab, ContractArvoEventTab, ArvoEventOperations].map((item, index) => (
            <React.Fragment key={index.toString()}>
              <div className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <h2 className={Md3Typography.headline.large}>{item.heading}</h2>
                  <Separator padding={8} />
                  <ReMark content={item.description} />
                </div>
              </div>
              <CodeBlock tabs={item.tabs} />
            </React.Fragment>
          ))}
        </div>
      </ContentContainer>
    </>
  );
};
