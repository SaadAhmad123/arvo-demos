import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { Md3Buttons } from '../../classNames/buttons';

type CopyButtonParam = {
  content: string;
  className?: string;
};

export const CopyButton: React.FC<CopyButtonParam> = ({ content, className }) => {
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
    <button type='button' onClick={handleCopy} className={className ?? Md3Buttons.icon}>
      {copied ? <LuCheck className='text-green-600' /> : <LuCopy />}
    </button>
  );
};
