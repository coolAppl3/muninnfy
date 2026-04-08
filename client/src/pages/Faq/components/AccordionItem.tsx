import { JSX, useState } from 'react';
import ChevronIcon from '../../../assets/svg/ChevronIcon.svg?react';

type AccordionItemProps = {
  question: string;
  answer: string;
  isLastItem?: boolean;
};

export default function AccordionItem({ question, answer }: AccordionItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='bg-secondary border-b-1 last:border-b-secondary not-last:border-b-light-gray'>
      <button
        type='button'
        className={`w-full flex justify-between items-start p-2 transition-colors text-title hover:text-cta cursor-pointer border-b-1 ${isExpanded ? 'border-b-light-gray' : 'border-b-secondary'}`}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className='text-start font-medium'>{question}</span>
        <div className='shrink-0 pt-[6px]'>
          <ChevronIcon
            className={`shrink-0 ml-1 w-[1.6rem] h-[1.6rem] transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transform-gpu transition-all duration-300 ${isExpanded ? 'max-h-[300px]' : 'max-h-0'}`}
      >
        <p className='px-2 py-2 text-description text-sm whitespace-break-spaces'>{answer}</p>
      </div>
    </div>
  );
}
