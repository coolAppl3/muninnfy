import { ChangeEvent, FormEvent, JSX, useMemo, useState } from 'react';
import Container from '../../../components/Container/Container';
import TextareaFormGroup from '../../../components/FormGroups/TextareaFormGroup';
import Button from '../../../components/Button/Button';
import WishlistItemTagsFormGroup from '../components/WishlistItemTagsFormGroup';
import DefaultFormGroup from '../../../components/FormGroups/DefaultFormGroup';
import {
  validateWishlistItemDescription,
  validateWishlistItemLink,
  validateWishlistItemTitle,
} from '../../../utils/validation/wishlistItemValidation';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import useAuth from '../../../hooks/useAuth';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useWishlist from '../useWishlist';
import { WishlistItem } from '../../../services/wishlistServices';
import { addWishlistItemService } from '../../../services/wishlistItemServices';
import { AsyncErrorData, getAsyncErrorData } from '../../../utils/errorUtils';
import useHistory from '../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export default function WishlistItemForm(): JSX.Element {
  const { wishlistId, setWishlistItems, wishlistItemsTitleSet, setWishlistItemsTitleSet } = useWishlist();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const [descriptionValue, setDescriptionValue] = useState<string>('');
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string | null>(null);

  const [linkValue, setLinkValue] = useState<string>('');
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);

  const [itemTags, setItemTags] = useState<Set<string>>(new Set());

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function handleSubmit(): Promise<void> {
    const title: string = titleValue;
    const description: string | null = descriptionValue || null;
    const link: string | null = linkValue || null;
    const tags: string[] = [...itemTags];

    try {
      const wishlistItem: WishlistItem = (await addWishlistItemService({ wishlistId, title, description, link, tags })).data;

      setWishlistItems((prev) => [...prev, wishlistItem]);
      setWishlistItemsTitleSet((prev) => new Set(prev).add(wishlistItem.title.toLowerCase()));

      displayPopupMessage('Item added.', 'success');
      clearForm();
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
        return;
      }

      if (status === 409) {
        errReason === 'duplicateItemTitle' && setWishlistItemsTitleSet((prev) => new Set(prev).add(title.toLowerCase()));
        return;
      }

      if (!errReason || ![400, 409].includes(status)) {
        return;
      }

      const setErrorMessage: ((errMessage: string | null) => void) | undefined = errFieldRecord[errReason];
      setErrorMessage && setErrorMessage(errMessage);
    }
  }

  const errFieldRecord: Record<string, (errorMessage: string | null) => void> = useMemo(
    () => ({
      invalidTitle: setTitleErrorMessage,
      invalidDescription: setDescriptionErrorMessage,
      invalidLink: setLinkErrorMessage,
    }),
    []
  );

  function allFieldsValid(): boolean {
    const newTitleErrorMessage: string | null = validateWishlistItemTitle(titleValue);
    setTitleErrorMessage(newTitleErrorMessage);

    const newDescriptionErrorMessage: string | null = validateWishlistItemDescription(descriptionValue);
    setDescriptionErrorMessage(newDescriptionErrorMessage);

    const newLinkErrorMessage: string | null = validateWishlistItemLink(linkValue);
    setLinkErrorMessage(newLinkErrorMessage);

    for (const errorMessage of [newTitleErrorMessage, newDescriptionErrorMessage, newLinkErrorMessage]) {
      if (errorMessage) {
        displayPopupMessage(errorMessage, 'error');
        return false;
      }
    }

    return true;
  }

  function itemAlreadyInWishlist(): boolean {
    const itemExists: boolean = wishlistItemsTitleSet.has(titleValue.toLowerCase());

    if (itemExists) {
      displayPopupMessage('Wishlist already contains this item.', 'error');
      setTitleErrorMessage('Wishlist already contains this item.');
    }

    return itemExists;
  }

  function clearForm(): void {
    setTitleValue('');
    setTitleErrorMessage(null);

    setDescriptionValue('');
    setDescriptionErrorMessage(null);

    setLinkValue('');
    setLinkErrorMessage(null);

    setItemTags(new Set());
  }

  return (
    <section className='wishlist-item-form'>
      <Container>
        <div className={`wishlist-item-form-container ${isExpanded ? 'expanded' : ''}`}>
          <Button
            className='expand-form-btn bg-cta border-cta w-full sm:w-fit h-fit'
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            New wishlist item
          </Button>

          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();

              if (isSubmitting || !allFieldsValid() || itemAlreadyInWishlist()) {
                return;
              }

              setIsSubmitting(true);
              displayLoadingOverlay();

              await handleSubmit();

              setIsSubmitting(false);
              removeLoadingOverlay();
            }}
          >
            <DefaultFormGroup
              id='item-title'
              label='Title'
              autoComplete='off'
              value={titleValue}
              errorMessage={titleErrorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newValue: string = e.target.value;

                setTitleValue(newValue);
                setTitleErrorMessage(validateWishlistItemTitle(newValue));
              }}
            />

            <DefaultFormGroup
              id='item-link'
              label='Link (optional)'
              autoComplete='off'
              value={linkValue}
              errorMessage={linkErrorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newValue: string = e.target.value;

                setLinkValue(newValue);
                setLinkErrorMessage(validateWishlistItemLink(newValue));
              }}
            />

            <WishlistItemTagsFormGroup
              itemTags={itemTags}
              setItemTags={setItemTags}
            />

            <TextareaFormGroup
              id='item-description'
              label='Description (optional)'
              value={descriptionValue}
              errorMessage={descriptionErrorMessage}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                const newValue: string = e.target.value;

                setDescriptionValue(newValue);
                setDescriptionErrorMessage(validateWishlistItemDescription(newValue));
              }}
            />

            <div className='btn-container'>
              <Button
                className='bg-secondary border-title text-title w-full order-2 sm:w-fit sm:order-1'
                onClick={() => {
                  setIsExpanded(false);
                  clearForm();
                }}
              >
                Cancel
              </Button>

              <Button
                isSubmitBtn={true}
                className='bg-cta border-cta w-full order-1 sm:w-fit sm:order-2'
              >
                Add wishlist item
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
