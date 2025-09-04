import { FocusEvent, FormEvent, JSX, MouseEvent, useState } from 'react';
import Container from '../../components/Container/Container';
import TripleDoteMenuIcon from '../../assets/svg/TripleDotMenuIcon.svg?react';
import './Wishlist.css';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../utils/constants/wishlistConstants';
import useConfirmModal from '../../hooks/useConfirmModal';
import { copyToClipboard, getFullDateString } from '../../utils/globalUtils';
import usePopupMessage from '../../hooks/usePopupMessage';
import DefaultFormGroup from '../../components/FormGroups/DefaultFormGroup';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import Button from '../../components/Button/Button';
import { validateWishlistTitle } from '../../utils/validation/wishlistValidation';
import { WishlistDetails } from '../../services/wishlistServices';
import { getWishlistPrivacyLevelName } from '../../utils/wishlistUtils';

export default function WishlistHeader({
  wishlistDetails,
  wishlistId,
}: {
  wishlistDetails: WishlistDetails;
  wishlistId: string;
}): JSX.Element {
  const [editMode, setEditMode] = useState<'TITLE' | 'PRIVACY_LEVEL' | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  function handlePrivacyLevelBtnClick(newPrivacyLevel: number, newPrivacyLevelName: string): void {
    if (newPrivacyLevel === wishlistDetails.privacy_level) {
      return;
    }

    displayConfirmModal({
      description: `Are you sure you want to set the privacy level to ${newPrivacyLevelName}?`,
      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      isDangerous: true,
      onConfirm: async () => {
        removeConfirmModal();
        await updateWishlistPrivacyLevel(newPrivacyLevel);
      },
      onCancel: removeConfirmModal,
    });
  }

  async function updateWishlistPrivacyLevel(newPrivacyLevel: number): Promise<void> {
    // TODO: continue implementation
  }

  async function deleteWishlist(): Promise<void> {
    // TODO: continue implementation
  }

  async function updateWishlistTitle(): Promise<void> {
    // TODO: continue implementation
  }

  async function handleContentMenuClick(id: string): Promise<void> {
    if (id === 'change-title-btn') {
      setTitleValue('');
      setTitleErrorMessage(null);

      setEditMode('TITLE');
      return;
    }

    if (id === 'change-privacy-level-btn') {
      setEditMode('PRIVACY_LEVEL');
      return;
    }

    if (id === 'share-wishlist-btn') {
      const successfullyCopied: boolean = await copyToClipboard(`${window.location.origin}/wishlist/view/${wishlistId}`);
      successfullyCopied
        ? displayPopupMessage('Share link copied to clipboard.', 'success')
        : displayPopupMessage('Failed to copy to clipboard.', 'error');

      return;
    }

    if (id === 'delete-wishlist-btn') {
      displayConfirmModal({
        title: 'Are you sure you want to delete this wishlist?',
        description: 'This action is irreversible.',
        confirmBtnTitle: 'Confirm',
        cancelBtnTitle: 'Cancel',
        isDangerous: true,
        onConfirm: async () => {
          removeConfirmModal();
          await deleteWishlist();
        },
        onCancel: removeConfirmModal,
      });
    }
  }

  return (
    <header className='wishlist-header'>
      <Container>
        <div className={`wishlist-header-container ${editMode ? 'expanded' : ''}`}>
          <div className='content'>
            <div
              className={`content-header ${menuIsOpen ? 'open' : ''}`}
              onBlur={(e: FocusEvent<HTMLDivElement>) => {
                if (e.relatedTarget) {
                  return;
                }

                setMenuIsOpen(false);
              }}
            >
              <h3>{wishlistDetails.title}</h3>

              <button
                type='button'
                onClick={() => setMenuIsOpen((prev) => !prev)}
              >
                <TripleDoteMenuIcon className='' />
              </button>

              <div
                className='content-menu'
                onClick={async (e: MouseEvent<HTMLDivElement>) => {
                  if (!(e.target instanceof HTMLButtonElement)) {
                    return;
                  }

                  setMenuIsOpen(false);
                  await handleContentMenuClick(e.target.id);
                }}
              >
                <button
                  type='button'
                  id='change-title-btn'
                >
                  Change title
                </button>
                <button
                  type='button'
                  id='change-privacy-level-btn'
                >
                  Change privacy level
                </button>
                <button
                  type='button'
                  id='share-wishlist-btn'
                >
                  Share wishlist
                </button>
                <button
                  type='button'
                  id='delete-wishlist-btn'
                  className='!text-danger'
                >
                  Delete wishlist
                </button>
              </div>
            </div>

            <p>
              Created on: <span>{getFullDateString(wishlistDetails.created_on_timestamp)}</span>
            </p>
            <p>
              Privacy level: <span>{getWishlistPrivacyLevelName(wishlistDetails.privacy_level)}</span>
            </p>
          </div>

          <div className='editing-container'>
            <div className='h-line'></div>

            {editMode === 'TITLE' ? (
              <form
                className='grid gap-2 w-full'
                onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();

                  if (isSubmitting) {
                    return;
                  }

                  const newTitleErrorMessage: string | null = validateWishlistTitle(titleValue);
                  setTitleErrorMessage(newTitleErrorMessage);

                  if (newTitleErrorMessage) {
                    displayPopupMessage(newTitleErrorMessage, 'error');
                    return;
                  }

                  setIsSubmitting(true);
                  displayLoadingOverlay();

                  await updateWishlistTitle();

                  setIsSubmitting(false);
                  removeLoadingOverlay();
                }}
              >
                <DefaultFormGroup
                  id='wishlist-title'
                  label='New wishlist title'
                  autoComplete='name'
                  value={titleValue}
                  errorMessage={titleErrorMessage}
                  onChange={(e) => {
                    const newValue: string = e.target.value;

                    // TODO: validate new value
                    setTitleValue(newValue);
                  }}
                />

                <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
                  <Button
                    isSubmitBtn={true}
                    className='bg-cta border-cta order-1 sm:order-2 w-full sm:w-fit'
                  >
                    Submit
                  </Button>

                  <Button
                    className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
                    onClick={() => setEditMode(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className='privacy-level'>
                <span>Privacy level</span>
                <div className='btn-container'>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === PRIVATE_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(PRIVATE_WISHLIST_PRIVACY_LEVEL, 'private')}
                  >
                    Private
                  </button>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === FOLLOWERS_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(FOLLOWERS_WISHLIST_PRIVACY_LEVEL, 'followers only')}
                  >
                    Followers
                  </button>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === PUBLIC_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(PUBLIC_WISHLIST_PRIVACY_LEVEL, 'public')}
                  >
                    Public
                  </button>
                </div>

                <button
                  className='link'
                  onClick={() => setEditMode(null)}
                >
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
