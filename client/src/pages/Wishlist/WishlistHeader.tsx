import { ChangeEvent, Dispatch, FocusEvent, FormEvent, JSX, MouseEvent, SetStateAction, useRef, useState } from 'react';
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
import {
  changeWishlistPrivacyLevelService,
  changeWishlistTitleService,
  deleteWishlistService,
  WishlistDetails,
} from '../../services/wishlistServices';
import { getWishlistPrivacyLevelName } from '../../utils/wishlistUtils';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useHistory from '../../hooks/useHistory';

export default function WishlistHeader({
  wishlistId,
  wishlistDetails,
  setWishlistDetails,
}: {
  wishlistId: string;
  wishlistDetails: WishlistDetails;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetails | null>>;
}): JSX.Element {
  type EditMode = 'TITLE' | 'PRIVACY_LEVEL' | 'DELETE_WISHLIST';

  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);
  const [deletionConfirmationTitleValue, setDeletionConfirmationTitleValue] = useState<string>('');

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  const titleRef = useRef<HTMLInputElement | null>(null);

  async function changeWishlistTitle(): Promise<void> {
    const newTitle: string = titleValue;

    try {
      await changeWishlistTitleService({ newTitle, wishlistId });
      setWishlistDetails(
        (prev) =>
          prev && {
            ...prev,
            title: newTitle,
          }
      );

      setTitleValue('');
      setEditMode(null);

      displayPopupMessage('Title updated.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (!errReason) {
        return;
      }

      if (status === 400) {
        if (errReason === 'invalidTitle') {
          setTitleErrorMessage(errMessage);
          return;
        }

        navigate(referrerLocation ? referrerLocation : '/account');
        return;
      }

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation ? referrerLocation : '/account');
      }
    }
  }

  async function changeWishlistPrivacyLevel(newPrivacyLevel: number): Promise<void> {
    try {
      await changeWishlistPrivacyLevelService({ wishlistId, newPrivacyLevel });
      setWishlistDetails(
        (prev) =>
          prev && {
            ...prev,
            privacy_level: newPrivacyLevel,
          }
      );

      displayPopupMessage(`Privacy level changed to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLocaleLowerCase()}.`, 'success');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (!errReason) {
        return;
      }

      if (status === 400 && errReason === 'invalidWishlistId') {
        navigate(referrerLocation ? referrerLocation : '/account');
        return;
      }

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation ? referrerLocation : '/account');
      }
    }
  }

  async function deleteWishlist(): Promise<void> {
    try {
      await deleteWishlistService(wishlistId);

      displayPopupMessage('Wishlist deleted.', 'success');
      navigate('/wishlists');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 400 && errReason === 'invalidWishlistId') {
        navigate(referrerLocation ? referrerLocation : '/account');
        return;
      }

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation ? referrerLocation : '/account');
      }
    }
  }

  async function handleContentMenuClick(id: string): Promise<void> {
    if (id === 'change-title-btn') {
      setTitleValue('');
      setTitleErrorMessage(null);

      setEditMode('TITLE');
      Promise.resolve().then(() => titleRef.current?.focus());

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
      setDeletionConfirmationTitleValue('');
      setEditMode('DELETE_WISHLIST');
    }
  }

  function handlePrivacyLevelBtnClick(newPrivacyLevel: number): void {
    if (newPrivacyLevel === wishlistDetails.privacy_level) {
      return;
    }

    displayConfirmModal({
      description: `Are you sure you want to set the privacy level to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLocaleLowerCase()}?`,
      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      isDangerous: true,
      onConfirm: async () => {
        removeConfirmModal();
        displayLoadingOverlay();

        await changeWishlistPrivacyLevel(newPrivacyLevel);
        removeLoadingOverlay();
      },
      onCancel: removeConfirmModal,
    });
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

            {editMode === 'TITLE' && (
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

                  await changeWishlistTitle();

                  setIsSubmitting(false);
                  removeLoadingOverlay();
                }}
              >
                <DefaultFormGroup
                  ref={titleRef}
                  id='wishlist-title'
                  label='New wishlist title'
                  autoComplete='name'
                  value={titleValue}
                  errorMessage={titleErrorMessage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newValue: string = e.target.value;

                    setTitleErrorMessage(validateWishlistTitle(newValue));
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
                    onClick={() => {
                      setEditMode(null);
                      setMenuIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {editMode === 'PRIVACY_LEVEL' && (
              <div className='privacy-level'>
                <span>Privacy level</span>
                <div className='btn-container'>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === PRIVATE_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(PRIVATE_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Private
                  </button>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === FOLLOWERS_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Followers
                  </button>
                  <button
                    type='button'
                    className={wishlistDetails?.privacy_level === PUBLIC_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => handlePrivacyLevelBtnClick(PUBLIC_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Public
                  </button>
                </div>

                <button
                  className='link'
                  onClick={() => {
                    setEditMode(null);
                    setMenuIsOpen(false);
                  }}
                >
                  Collapse
                </button>
              </div>
            )}

            {editMode === 'DELETE_WISHLIST' && (
              <form
                className='grid gap-2 w-full'
                onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();

                  if (isSubmitting || deletionConfirmationTitleValue !== wishlistDetails.title) {
                    return;
                  }

                  setIsSubmitting(true);
                  displayLoadingOverlay();

                  await deleteWishlist();

                  setIsSubmitting(false);
                  removeLoadingOverlay();
                }}
              >
                <div className='text-description'>
                  <p className='font-medium mb-[6px]'>Are you sure you want to delete this wishlist?</p>
                  <p className='text-sm'>
                    <span className='text-danger'>This action is irreversible.</span> To proceed, confirm your wishlist title below:
                  </p>
                </div>

                <DefaultFormGroup
                  id='confirm-wishlist-title'
                  label={`Enter "${wishlistDetails.title}"`}
                  autoComplete='name'
                  value={deletionConfirmationTitleValue}
                  errorMessage={null}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDeletionConfirmationTitleValue(e.target.value)}
                />

                <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
                  <Button
                    isSubmitBtn={true}
                    className='bg-danger border-danger order-1 sm:order-2 w-full sm:w-fit'
                    disabled={editMode === 'DELETE_WISHLIST' ? deletionConfirmationTitleValue !== wishlistDetails.title : true}
                  >
                    Delete wishlist
                  </Button>

                  <Button
                    className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
                    onClick={() => {
                      setEditMode(null);
                      setMenuIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {!editMode && (
              // meant to smooth out the menu collapse
              <div className='h-[15rem] w-full'></div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
