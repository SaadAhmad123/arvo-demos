import { Md3ContentPadding } from '../classNames';
import { Md3Cards } from '../classNames/cards';
import { Md3Typography } from '../classNames/typography';
import { ContentContainer } from '../components/ContentContainer';
import { withNavBar } from '../components/Navbar/withNavBar';
import { ReMark } from '../components/ReMark';
import { Separator } from '../components/Separator';
import { cleanString } from '../utils';

export const LicensePage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer content>
        <section className='grid grid-cols-1 gap-2' aria-labelledby='license-title'>
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>License</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Arvo is <strong>open source</strong> and released under the <strong>MIT License</strong>, one of the
                most permissive and widely-used software licenses available.
              </p>
            </div>
          </div>
        </section>
      </ContentContainer>
      <Separator padding={32} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
            # A Vision for Openness
            
            The vision of Arvo is to be <strong>fully open source and transparent</strong> so that anyone can leverage
            it. The foundations for building application should be accessible to everyone, from individual developers to
            large enterprises, without restrictions or lock-ins.

            This extends beyond just making the code available. It means building a toolkit that
            respects your freedom to use, modify, distribute, and build upon Arvo in whatever way serves your needs
            best. Whether you're building a small application or enterprise-scale distributed systems, Arvo remains
            yours to use without limitations.
          `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <h2 className={`${Md3Typography.headline.large} text-on-surface mb-4`}>The MIT License</h2>
          <div className={`${Md3Cards.outlined} p-6`}>
            <pre className={`${Md3Typography.body.medium} whitespace-pre-wrap font-mono`}>
              {`The MIT License (MIT)

Copyright (c) 2024 Saad Ahmad

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`}
            </pre>
          </div>
          <Separator padding={12} />
          <p className={`${Md3Typography.body.medium} opacity-75`}>
            View the full license on{' '}
            <a
              href='https://github.com/SaadAhmad123/arvo-core/blob/main/LICENSE.md'
              target='_blank'
              rel='noreferrer'
              className='underline hover:text-blue-600'
            >
              GitHub
            </a>
          </p>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
            # What This Means for You
            
            The MIT License grants you broad permissions with minimal restrictions. You can use Arvo in commercial
            projects, modify it to suit your specific needs, distribute your own versions, and incorporate it into
            proprietary software. The only requirement is that you include the original copyright notice and license
            text in any copies or substantial portions of the software.
          `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={54} />
    </main>
  );
});
