import { JSX, Key, MouseEvent, useState } from 'react';
import { WishlistItemInterface } from '../../../../services/wishlistServices';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';

export default function WishlistItem({ item }: { item: WishlistItemInterface }): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className={`wishlist-item ${isExpanded ? 'expanded' : ''}`}>
      <div
        className='header'
        onClick={() => setIsExpanded((prev) => !prev)}
        tabIndex={0}
        title={`${isExpanded ? 'Collapse' : 'Expand'} item.`}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} item.`}
      >
        <h4>{item.title}</h4>
        <span>
          <ChevronIcon />
        </span>
      </div>

      <div className='body'>
        <div className='body-content'>
          <div className='info'>
            <p>Added: {getShortenedDateString(item.added_on_timestamp)}</p>
            <p>
              Link:{' '}
              {item.link ? (
                <a
                  href={/^https?:\/\//.test(item.link) ? item.link : `https://${item.link}`}
                  target='_blank'
                  className='link'
                >
                  {item.link}
                </a>
              ) : (
                <span>None</span>
              )}
            </p>
          </div>

          <div className='tags'>
            {item.tags.map((tag: { id: number; name: string }) => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>

          {item.description && (
            <>
              <div className='h-line'></div>
              <p>{item.description}</p>
            </>
          )}
        </div>

        <div className='body-btn-container grid gap-1'>
          <button
            type='button'
            className='item-menu-btn'
            title='Menu'
            aria-label='Menu'
          >
            <TripleDotMenuIcon className='text-title rotate-180' />
          </button>

          <button
            type='button'
            className='mark-as-purchased-btn'
            title={`Mark as ${item.is_purchased ? 'purchased.' : 'not purchased.'}`}
            aria-label={`Mark as ${item.is_purchased ? 'purchased.' : 'not purchased.'}`}
          >
            <CheckIcon className='text-dark' />
          </button>

          {/* TODO: implement context menu */}
        </div>
      </div>
    </div>
  );
}
