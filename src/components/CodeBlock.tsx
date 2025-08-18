import React from 'react';
import type { BundledLanguage, BundledTheme } from 'shiki';
import { createHighlighter } from 'shiki';
import { usePromise } from '../hooks/usePromise';
import { useValueChange } from '../hooks/useValueChange';
import { Md3Cards } from '../classNames/cards';
import { Md3Typography } from '../classNames/typography';
import { Md3Buttons } from '../classNames/buttons';
import { MdContentCopy, MdCheck } from 'react-icons/md';

export type CodeBlockProps = {
  tabs: {
    lang: BundledLanguage;
    title?: string;
    code: string;
  }[];
  theme?: BundledTheme;
  wrap?: boolean;
  showCopy?: boolean;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  tabs,
  theme = 'material-theme',
  wrap = false,
  showCopy = true,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeTab = tabs[activeIndex];

  const shiki = usePromise(async (src: string, l: BundledLanguage, th: BundledTheme) => {
    const highlighter = await createHighlighter({ langs: [l], themes: [th] });
    return highlighter.codeToHtml(src, { lang: l, theme: th });
  }, []);

  useValueChange({ code: activeTab.code, lang: activeTab.lang, theme }, (val) => {
    void shiki.retry(val.code, val.lang, val.theme);
  });

  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const isLoading = shiki.state === 'idle' || shiki.state === 'loading';
  const isError = shiki.state === 'error';

  return (
    <figure className={`${Md3Cards.outlined} overflow-hidden`} style={{ backgroundColor: '#263238' }}>
      <figcaption
        className='flex items-center justify-between px-4 py-2 border-b border-outline overflow-auto gap-6 bg-background'
        aria-live='polite'
      >
        <div className='flex space-x-2'>
          {tabs.map((tab, idx) => (
            <button
              key={idx.toString()}
              type='button'
              onClick={() => setActiveIndex(idx)}
              className={`${
                idx === activeIndex
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              } px-2 py-1 text-sm font-medium cursor-pointer`}
            >
              {tab.title || tab.lang}
            </button>
          ))}
        </div>
        {showCopy && (
          <button type='button' className={Md3Buttons.icon} onClick={onCopy} aria-label='Copy code to clipboard'>
            {copied ? <MdCheck /> : <MdContentCopy />}
          </button>
        )}
      </figcaption>

      {isLoading && (
        <pre
          className={`p-4 font-mono ${Md3Typography.body.small} text-on-surface-variant opacity-80 ${wrap ? 'whitespace-pre-wrap break-words' : ''}`}
        >
          Loading…
        </pre>
      )}

      {isError && !isLoading && (
        <pre
          className={`p-4 font-mono ${Md3Typography.body.small} text-error ${wrap ? 'whitespace-pre-wrap break-words' : ''}`}
        >
          {String(shiki.error?.message || 'Failed to highlight code')}
        </pre>
      )}

      {!isLoading && !isError && shiki.data && (
        <div
          className={`[&_.shiki]:m-0 [&_.shiki]:max-h-[60vh] [&_.shiki]:overflow-auto [&_.shiki]:px-4 [&_.shiki]:py-5 [&_.shiki]:font-mono [&_.shiki]:text-sm [&_.shiki]:leading-6 ${wrap ? '[&_.shiki]:whitespace-pre-wrap [&_.shiki]:break-words [&_.shiki]:[overflow-wrap:anywhere]' : ''}`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: This is fine
          dangerouslySetInnerHTML={{ __html: shiki.data }}
        />
      )}
    </figure>
  );
};

export default CodeBlock;
