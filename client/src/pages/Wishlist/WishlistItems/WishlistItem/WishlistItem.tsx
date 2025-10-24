import { Dispatch, JSX, memo, SetStateAction, useState } from 'react';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import WishlistItemForm from '../../components/WishlistItemForm';
import { WishlistItemType } from '../../../../types/wishlistItemTypes';
import WishlistItemButtonContainer from './components/WishlistItemButtonContainer';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';
import { useWishlistItemsExpansionStore } from '../../stores/wishlistItemsExpansionStore';
import { useShallow } from 'zustand/react/shallow';
import { useWishlistItemsSelectionStore } from '../../stores/wishlistItemsSelectionStore';

type WishlistItemProps = {
  wishlistItem: WishlistItemType;
  selectionModeActive: boolean;
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;
};

export default memo(WishlistItem);
function WishlistItem({ wishlistItem, selectionModeActive, setWishlistItems }: WishlistItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { toggleWishlistItemExpansion, isExpanded } = useWishlistItemsExpansionStore(
    useShallow((store) => ({
      toggleWishlistItemExpansion: store.toggleWishlistItemsExpansion,
      isExpanded: store.expandedItemsIdsSet.has(wishlistItem.item_id),
    }))
  );

  const { toggleWishlistItemSelection, isSelected } = useWishlistItemsSelectionStore(
    useShallow((store) => ({
      toggleWishlistItemSelection: store.toggleWishlistItemSelection,
      isSelected: store.selectedItemsIdsSet.has(wishlistItem.item_id),
    }))
  );

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
            title={isSelected ? 'Unselect item' : 'Select item'}
            aria-label={isSelected ? 'Unselect item' : 'Select item'}
            className='bg-[#555] p-[4px] rounded-[1px] ml-1 cursor-pointer transition-[filter] hover:brightness-75'
            onClick={() => toggleWishlistItemSelection(wishlistItem.item_id)}
          >
            <CheckIcon
              className={`w-[1.2rem] h-[1.2rem] transition-transform text-cta ${isSelected ? 'scale-100 rotate-0' : 'rotate-180 scale-0'}`}
            />
          </button>
        )}

        <button
          onClick={() => toggleWishlistItemExpansion(wishlistItem.item_id)}
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
            <ChevronIcon className={`text-title w-[1.6rem] h-[1.6rem] ${isExpanded ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className='flex justify-between items-start gap-1 p-2 pt-1'>
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

            {wishlistItem.tags.length > 0 && (
              <div>
                {wishlistItem.tags.map((tag: { id: number; name: string }) => (
                  <span
                    key={tag.id}
                    className='inline-block p-[4px] m-[2px] bg-light text-dark rounded leading-[1] break-words max-w-[20rem] font-medium'
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

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
            setWishlistItems={setWishlistItems}
          />
        </div>
      )}
    </div>
  );
}
