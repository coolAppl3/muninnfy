import { FocusEvent, JSX, useState } from 'react';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';
import WishlistItemForm from '../../components/WishlistItemForm';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { deleteWishlistItemService, setWishlistItemIsPurchasedService } from '../../../../services/wishlistItemServices';
import useWishlist from '../../context/useWishlist';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';
import { WishlistItemType } from '../../../../types/wishlistItemTypes';

type WishlistItemProps = {
  wishlistItem: WishlistItemType;
};

export default function WishlistItem({ wishlistItem }: WishlistItemProps): JSX.Element {
  const { wishlistId, setWishlistItems } = useWishlist();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatingPurchaseStatus, setUpdatingPurchaseState] = useState<boolean>(false);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function setWishlistItemIsPurchased(): Promise<void> {
    setUpdatingPurchaseState(true);

    try {
      await setWishlistItemIsPurchasedService({ wishlistId, itemId: wishlistItem.item_id, newPurchaseStatus: !wishlistItem.is_purchased });
      setWishlistItems((prev) =>
        prev.map((item: WishlistItemType) => {
          if (item.item_id !== wishlistItem.item_id) {
            return item;
          }

          return {
            ...item,
            is_purchased: !wishlistItem.is_purchased,
          };
        })
      );
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status !== 404) {
        return;
      }

      if (errReason === 'wishlistNotFound') {
        navigate(referrerLocation || '/account');
        return;
      }

      setWishlistItems((prev) => prev.filter((item: WishlistItemType) => item.item_id !== wishlistItem.item_id));
    } finally {
      setUpdatingPurchaseState(false);
    }
  }

  async function removeWishlistItem(): Promise<void> {
    displayLoadingOverlay();

    try {
      await deleteWishlistItemService(wishlistId, wishlistItem.item_id);
      setWishlistItems((prev) => prev.filter((item: WishlistItemType) => item.item_id !== wishlistItem.item_id));

      displayPopupMessage('Item removed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
      }
    } finally {
      removeLoadingOverlay();
    }
  }

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
    <div className={`bg-secondary rounded-sm shadow-simple-tiny ${isExpanded ? 'expanded' : ''}`}>
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

      <div className={isExpanded ? 'flex justify-between items-start gap-1 p-2 pt-1' : 'hidden'}>
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

        <div
          className={`grid gap-1 mr-[-1rem] relative place-items-center ${menuIsOpen ? 'open' : ''}`}
          onBlur={(e: FocusEvent<HTMLDivElement>) => {
            if (e.relatedTarget?.classList.contains('context-menu-btn')) {
              return;
            }

            setMenuIsOpen(false);
          }}
        >
          <button
            type='button'
            className={`p-1 rounded-[50%] transition-colors cursor-pointer hover:bg-dark mt-[-8px] ${
              menuIsOpen ? 'bg-dark text-cta' : 'text-title'
            }`}
            title='Menu'
            aria-label='Menu'
            onClick={() => setMenuIsOpen((prev) => !prev)}
          >
            <TripleDotMenuIcon className='w-[1.6rem] h-[1.6rem] rotate-180' />
          </button>

          {updatingPurchaseStatus ? (
            <div className='spinner w-[2.6rem] h-[2.6rem] my-[5px]'></div>
          ) : (
            <button
              type='button'
              className={`p-1 rounded-[50%] transition-colors cursor-pointer  ${
                wishlistItem.is_purchased ? 'bg-cta hover:bg-cta/75' : 'bg-light/50 hover:bg-light'
              }`}
              title={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'unpurchased'}`}
              aria-label={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'unpurchased'}`}
              onClick={async () => await setWishlistItemIsPurchased()}
            >
              <CheckIcon className='w-[1.6rem] h-[1.6rem] text-dark' />
            </button>
          )}

          <div
            className={`absolute top-[-1rem] right-4 rounded-sm overflow-hidden shadow-centered-tiny ${menuIsOpen ? 'block' : 'hidden'}`}
          >
            <button
              type='button'
              className='context-menu-btn'
              onClick={() => {
                setMenuIsOpen(false);
                setIsEditing(true);
              }}
            >
              Edit
            </button>

            <button
              type='button'
              className='context-menu-btn danger'
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
