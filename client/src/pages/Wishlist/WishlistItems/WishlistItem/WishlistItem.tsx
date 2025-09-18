import { FocusEvent, JSX, useState } from 'react';
import { WishlistItemInterface } from '../../../../services/wishlistServices';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';
import WishlistItemForm from '../../components/WishlistItemForm';

export default function WishlistItem({ item }: { item: WishlistItemInterface }): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  async function removeWishlistItem(): Promise<void> {
    // TODO: implement
  }

  if (isEditing) {
    return (
      <div className='wishlist-item p-2'>
        <WishlistItemForm
          formMode='EDIT_ITEM'
          wishlistItem={item}
          onFinish={() => setIsEditing(false)}
        />
      </div>
    );
  }

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

        <div
          className={`body-btn-container ${menuIsOpen ? 'open' : ''}`}
          onBlur={(e: FocusEvent<HTMLDivElement>) => {
            if (e.relatedTarget) {
              return;
            }

            setMenuIsOpen(false);
          }}
        >
          <button
            type='button'
            className='item-menu-btn'
            title='Menu'
            aria-label='Menu'
            onClick={() => setMenuIsOpen((prev) => !prev)}
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

          <div className='item-menu'>
            <button
              type='button'
              onClick={() => {
                setMenuIsOpen(false);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
            <button
              type='button'
              className='!text-danger'
              onClick={async () => {
                setMenuIsOpen(false);
                await removeWishlistItem();
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
