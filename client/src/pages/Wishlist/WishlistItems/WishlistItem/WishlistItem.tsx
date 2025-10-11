import { JSX, memo, useEffect, useState } from 'react';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import WishlistItemForm from '../../components/WishlistItemForm';
import { WishlistItemType } from '../../../../types/wishlistItemTypes';
import WishlistItemButtonContainer from './components/WishlistItemButtonContainer/WishlistItemButtonContainer';
import useWishlist from '../../context/useWishlist';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';

type WishlistItemProps = {
  wishlistItem: WishlistItemType;
};

export default memo(WishlistItem);
function WishlistItem({ wishlistItem }: WishlistItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { wishlistViewConfig, selectionModeActive, selectedItemsSet, setSelectedItemsSet } = useWishlist();
  const { expandAllWishlistItems } = wishlistViewConfig;

  useEffect(() => {
    setIsExpanded(expandAllWishlistItems);
  }, [expandAllWishlistItems]);

  if (isEditing) {
    return (
      <div className='py-2 bg-secondary rounded-sm shadow-simple-tiny'>
        <WishlistItemForm
          formMode='EDIT_ITEM'
          wishlistItem={wishlistItem}
          onFinish={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className='bg-secondary rounded-sm shadow-simple-tiny'>
      <div className='flex justify-start items-center gap-1'>
        {selectionModeActive && (
          <button
            type='button'
            className='bg-[#555] p-[4px] rounded-[1px] ml-1 cursor-pointer transition-[filter] hover:brightness-75'
            onClick={() =>
              selectedItemsSet.has(wishlistItem.item_id)
                ? setSelectedItemsSet((prev) => {
                    const newSet = new Set<number>(prev);
                    newSet.delete(wishlistItem.item_id);

                    return newSet;
                  })
                : setSelectedItemsSet((prev) => new Set<number>(prev).add(wishlistItem.item_id))
            }
          >
            <CheckIcon
              className={`w-[1.2rem] h-[1.2rem] transition-transform text-cta ${
                selectedItemsSet.has(wishlistItem.item_id) ? 'scale-100 rotate-0' : 'rotate-180 scale-0'
              }`}
            />
          </button>
        )}

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          tabIndex={0}
          title={`${isExpanded ? 'Collapse' : 'Expand'} item`}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} item`}
          className={`relative bg-secondary w-full flex justify-between items-start gap-1 px-2 py-1 transition-all hover:brightness-110 cursor-pointer border-b-1 rounded-sm overflow-hidden ${
            isExpanded ? 'rounded-bl-none rounded-br-none border-b-light-gray' : 'border-b-secondary'
          } ${
            wishlistItem.is_purchased
              ? 'after:absolute after:top-[-1rem] after:right-[-1rem] after:w-2 after:h-2 after:bg-cta after:rotate-45 after:z-1'
              : ''
          }`}
        >
          <h4 className='text-title py-[8.4px]'>{wishlistItem.title}</h4>
          <span className='p-1 rounded-[50%] mr-[-1rem]'>
            <ChevronIcon className='text-title w-[1.6rem] h-[1.6rem]' />
          </span>
        </button>
      </div>

      <div className={`justify-between items-start gap-1 p-2 pt-1 ${isExpanded ? 'flex' : 'hidden'}`}>
        <div className='w-full text-sm text-description grid gap-1'>
          <div className='pr-1 whitespace-nowrap overflow-hidden text-ellipsis'>
            <p>Added: {getShortenedDateString(wishlistItem.added_on_timestamp)}</p>

            <p>
              Link:{' '}
              {wishlistItem.link ? (
                <a
                  href={/^https?:\/\//.test(wishlistItem.link) ? wishlistItem.link : `https://${wishlistItem.link}`}
                  target='_blank'
                  className='link'
                >
                  {wishlistItem.link}
                </a>
              ) : (
                <span className='brightness-75'>None</span>
              )}
            </p>
          </div>

          <div className='tags'>
            {wishlistItem.tags.map((tag: { id: number; name: string }) => (
              <span
                key={tag.id}
                className='inline-block p-[4px] m-[2px] bg-light text-dark rounded leading-[1] break-words max-w-[20rem] font-medium'
              >
                {tag.name}
              </span>
            ))}
          </div>

          {wishlistItem.description && (
            <>
              <div className='h-line'></div>
              <p className='whitespace-break-spaces'>{wishlistItem.description}</p>
            </>
          )}
        </div>

        <WishlistItemButtonContainer
          wishlistItem={wishlistItem}
          setIsEditing={setIsEditing}
        />
      </div>
    </div>
  );
}
