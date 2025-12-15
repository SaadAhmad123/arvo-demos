import { IoClose } from 'react-icons/io5';
import { Md3Cards } from '../../../../../classNames/cards';
import { ReMark } from '../../../../../components/ReMark';

interface TopicViewerProps {
  content: string;
  onClose: () => void;
  category: 'resumable' | 'agentic' | 'engine';
}

export const TopicViewer: React.FC<TopicViewerProps> = ({ content, onClose, category }) => {
  const categoryLabels = {
    resumable: 'ArvoResumable',
    agentic: 'Agentic Core',
    engine: 'Agent Actions Engine',
  };

  return (
    <div
      className={`${Md3Cards.filled} bg-surface-container p-6 rounded-3xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
    >
      <div className='flex justify-between items-center mb-4'>
        <span className='px-4 py-2 rounded-full text-sm font-medium bg-primary text-on-primary'>
          {categoryLabels[category]}
        </span>
        <button
          type='button'
          onClick={onClose}
          className='flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 hover:bg-error/20 text-error transition-colors font-medium'
        >
          <IoClose className='text-xl' />
          Close
        </button>
      </div>
      <div>
        <ReMark content={content} />
      </div>
    </div>
  );
};
