import { FocusEvent, JSX, useState } from 'react';
import { WishlistItemType } from '../../../../services/wishlistServices';
import { getShortenedDateString } from '../../../../utils/globalUtils';
import ChevronIcon from '../../../../assets/svg/ChevronIcon.svg?react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import CheckIcon from '../../../../assets/svg/CheckIcon.svg?react';
import WishlistItemForm from '../../components/WishlistItemForm';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { deleteWishlistItemService, setWishlistItemIsPurchasedService } from '../../../../services/wishlistItemServices';
import useWishlist from '../../useWishlist';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';

export default function WishlistItem({ wishlistItem }: { wishlistItem: WishlistItemType }): JSX.Element {
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
      <div className='wishlist-item p-2'>
        <WishlistItemForm
          formMode='EDIT_ITEM'
          wishlistItem={wishlistItem}
          onFinish={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`wishlist-item ${isExpanded ? 'expanded' : ''} ${wishlistItem.is_purchased ? 'purchased' : ''}`}>
      <button
        className='header'
        onClick={() => setIsExpanded((prev) => !prev)}
        tabIndex={0}
        title={`${isExpanded ? 'Collapse' : 'Expand'} item`}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} item`}
      >
        <h4>{wishlistItem.title}</h4>
        <span>
          <ChevronIcon />
        </span>
      </button>

      <div className='body'>
        <div className='body-content'>
          <div className='info'>
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
                <span>None</span>
              )}
            </p>
          </div>

          <div className='tags'>
            {wishlistItem.tags.map((tag: { id: number; name: string }) => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>

          {wishlistItem.description && (
            <>
              <div className='h-line'></div>
              <p className='description'>{wishlistItem.description}</p>
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

          {updatingPurchaseStatus ? (
            <div className='spinner'></div>
          ) : (
            <button
              type='button'
              className={`mark-as-purchased-btn ${wishlistItem.is_purchased ? 'purchased' : ''}`}
              title={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'not purchased'}`}
              aria-label={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'not purchased'}`}
              onClick={async () => await setWishlistItemIsPurchased()}
            >
              <CheckIcon className='text-dark' />
            </button>
          )}

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
