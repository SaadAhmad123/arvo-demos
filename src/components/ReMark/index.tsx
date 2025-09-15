import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { CopyButton } from '../buttons/Copy';
import { Md3Table } from '../../classNames/table';
import { Md3Typography } from '../../classNames/typography';

const isValidMarkdown = (text: string) => {
  try {
    unified().use(remarkParse).use(remarkGfm).parse(text);
    return true;
  } catch {
    return false;
  }
};

export const ReMark: React.FC<{ content: string | null }> = ({ content }) => {
  const tableClassNames = Md3Table.variants.compact;
  if (!content) return <></>;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ node, ...props }) => (
          <div className='grid grid-cols-1 rounded-xl overflow-hidden border border-outline-variant'>
            <div className='overflow-y-auto'>
              <table className={tableClassNames.table} {...props} />
            </div>
          </div>
        ),
        thead: ({ node, ...props }) => <thead {...props} />,
        th: ({ node, ...props }) => <th className={tableClassNames.header} {...props} />,
        td: ({ node, ...props }) => <td className={tableClassNames.cell} {...props} />,
        tr: ({ node, ...props }) => <tr className={tableClassNames.row} {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className='border-l-4 border-primary bg-secondary-container text-on-secondary-container p-2 my-2'
            {...props}
          />
        ),
        a: ({ node, ...props }) => <a className='hover:underline text-blue-600' target='_blank' {...props} />,
        p: ({ node, ...props }) => <p className={`py-2 ${Md3Typography.body.medium}`} {...props} />,
        ul: ({ node, ...props }) => <ul className='list-disc ml-5 my-2' {...props} />,
        ol: ({ node, ...props }) => <ol className='list-decimal ml-5 my-2' {...props} />,
        li: ({ node, ...props }) => <li className='my-1' {...props} />,
        hr: () => <hr className='bg-gray-200 mt-2 mb-4 h-[1px] border-none' />,
        code: ({ children, className }) => {
          if (!className)
            return <code className='inline-block bg-surface-container-highest px-1 py-1 rounded'>{children}</code>;
          return (
            <div className='relative grid grid-col-1 my-4 px-4 py-2 bg-secondary text-base rounded-xl'>
              <div className='overflow-auto'>
                <code>
                  <span className='!font-sans text-xs'>{className?.replace('language-', '')}</span>
                  <br />
                  {children}
                </code>
              </div>
              <div className='absolute top-2 right-2'>
                <CopyButton content={children as string} />
              </div>
            </div>
          );
        },
      }}
    >
      {isValidMarkdown(content) ? content : content.toString()}
    </ReactMarkdown>
  );
};
