import { useState, useEffect, useRef } from 'react';
import { LuCopy, LuCheck } from 'react-icons/lu';

type CopyButtonParam = {
  content: string;
};

export const CopyButton: React.FC<CopyButtonParam> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='size-8 hover:bg-gray-200 hover:text-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200'
    >
      {copied ? <LuCheck className='text-green-600' /> : <LuCopy />}
    </button>
  );
};
