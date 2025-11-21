import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { HiClipboardDocumentCheck, HiLink } from 'react-icons/hi2'; // or use any icon you prefer
import { Md3Table } from '../../classNames/table';
import { Md3Typography } from '../../classNames/typography';
import Mermaid from './Mermaid';
import CodeBlock from '../CodeBlock';
import type { BundledLanguage } from 'shiki';

const isValidMarkdown = (text: string) => {
  try {
    unified().use(remarkParse).use(remarkGfm).use(rehypeRaw).parse(text);
    return true;
  } catch {
    return false;
  }
};

// Generate slug from heading text
const generateSlug = (text: string | React.ReactNode): string => {
  const textContent = typeof text === 'string' ? text : React.Children.toArray(text).join('');

  return textContent
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

// Heading component with animated link icon
const HeadingWithAnchor: React.FC<{
  level: 1 | 2 | 3;
  children: React.ReactNode;
  className: string;
}> = ({ level, children, className }) => {
  const [copied, setCopied] = React.useState(false);
  const slug = generateSlug(children);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState(null, '', `#${slug}`);
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLinkClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent heading click event
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Tag id={slug} className={`${className} group scroll-mt-20 relative cursor-pointer`} onClick={handleClick}>
      <span className='flex items-center'>
        <span className='group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>{children}</span>
        <button
          type='button'
          onClick={handleLinkClick}
          className='hidden md:block opacity-0 group-hover:opacity-100 w-0 group-hover:w-5 group-hover:ml-4 transition-all duration-100 ease-in-out flex-shrink-0 border-none bg-transparent p-0 cursor-pointer'
          aria-label='Copy link to clipboard'
        >
          {copied ? (
            <HiClipboardDocumentCheck className='h-5 w-5 text-primary' />
          ) : (
            <HiLink className='h-5 w-5 text-primary' />
          )}
        </button>
      </span>
    </Tag>
  );
};

export const ReMark: React.FC<{
  content: string | null;
  tableType?: 'compact' | 'defautl';
  bodyTextSize?: 'large' | 'default';
}> = ({ content, tableType = 'compact', bodyTextSize = 'default' }) => {
  const tableClassNames = tableType === 'compact' ? Md3Table.variants.compact : Md3Table.variants.default;
  const bodyTextClassNames = bodyTextSize === 'default' ? Md3Typography.body.medium : Md3Typography.body.large;
  if (!content) return <></>;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        table: ({ node, ...props }) => (
          <div className='grid grid-cols-1 rounded-xl overflow-hidden border border-outline-variant'>
            <div className='overflow-y-auto'>
              <table className={tableClassNames.table} {...props} />
            </div>
          </div>
        ),
        h1: ({ children }) => (
          <HeadingWithAnchor level={1} className={`${Md3Typography.headline.large} text-on-surface-variant my-2`}>
            {children}
          </HeadingWithAnchor>
        ),
        h2: ({ children }) => (
          <HeadingWithAnchor level={2} className={`${Md3Typography.headline.medium} text-on-surface-variant my-2`}>
            {children}
          </HeadingWithAnchor>
        ),
        h3: ({ children }) => (
          <HeadingWithAnchor level={3} className={`${Md3Typography.headline.small} text-on-surface-variant my-2`}>
            {children}
          </HeadingWithAnchor>
        ),
        thead: ({ node, ...props }) => <thead {...props} />,
        th: ({ node, ...props }) => <th className={tableClassNames.header} {...props} />,
        td: ({ node, ...props }) => <td className={tableClassNames.cell} {...props} />,
        tr: ({ node, ...props }) => <tr className={tableClassNames.row} {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className='border-l-4 border-primary bg-secondary-container text-on-secondary-container p-2 mt-2 mb-4'
            {...props}
          />
        ),
        a: ({ node, ...props }) => <a className='text-blue-600 no-underline' target='_blank' {...props} />,
        p: ({ node, ...props }) => <p className={`py-2 ${bodyTextClassNames}`} {...props} />,
        ul: ({ node, ...props }) => <ul className={`list-disc ml-5 my-2 ${bodyTextClassNames}`} {...props} />,
        ol: ({ node, ...props }) => <ol className={`list-decimal ml-5 my-2 ${bodyTextClassNames}`} {...props} />,
        li: ({ node, ...props }) => <li className={`my-1 ${bodyTextClassNames}`} {...props} />,
        hr: () => <hr className='bg-gray-200 mt-2 mb-4 h-[1px] border-none' />,
        code: ({ children, className }) => {
          if (!className)
            return <code className='inline-block bg-surface-container-highest px-1 rounded'>{children}</code>;
          const content = Array.isArray(children) ? children.join('') : String(children);
          if (className?.includes('language-mermaid')) {
            return <Mermaid chart={content.trim()} />;
          }
          return (
            <CodeBlock
              tabs={[
                {
                  title: className?.split('-')?.[1] ?? 'code',
                  lang: (className?.split('-')?.[1] ?? 'typescript') as BundledLanguage,
                  code: content,
                },
              ]}
            />
          );
        },
      }}
    >
      {isValidMarkdown(content) ? content : content.toString()}
    </ReactMarkdown>
  );
};
