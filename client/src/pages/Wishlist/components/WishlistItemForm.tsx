import { ChangeEvent, FormEvent, JSX, useMemo, useState } from 'react';
import TextareaFormGroup from '../../../components/FormGroups/TextareaFormGroup';
import Button from '../../../components/Button/Button';
import WishlistItemTagsFormGroup from './WishlistItemTagsFormGroup';
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
import { WishlistItemInterface } from '../../../services/wishlistServices';
import { addWishlistItemService } from '../../../services/wishlistItemServices';
import { AsyncErrorData, getAsyncErrorData } from '../../../utils/errorUtils';
import useHistory from '../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export default function WishlistItemForm({
  formMode,
  wishlistItem,
  onFinish,
}: {
  formMode: 'NEW_ITEM' | 'EDIT_ITEM';
  wishlistItem?: WishlistItemInterface;
  onFinish: () => void;
}): JSX.Element {
  const { wishlistId, setWishlistItems, wishlistItemsTitleSet } = useWishlist();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [titleValue, setTitleValue] = useState<string>(wishlistItem?.title || '');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const [descriptionValue, setDescriptionValue] = useState<string>(wishlistItem?.description || '');
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string | null>(null);

  const [linkValue, setLinkValue] = useState<string>(wishlistItem?.link || '');
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);

  const [itemTags, setItemTags] = useState<Set<string>>(new Set(wishlistItem?.tags.map(({ name }) => name) || []));

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function handleSubmit(): Promise<void> {
    if (formMode === 'NEW_ITEM' && !itemAlreadyInWishlist()) {
      await addWishlistItem();
      onFinish();

      return;
    }

    if (!changesDetected()) {
      displayPopupMessage('No changes detected.', 'error');
      return;
    }

    await editWishlistItem();
  }

  async function addWishlistItem(): Promise<void> {
    const title: string = titleValue;
    const description: string | null = descriptionValue || null;
    const link: string | null = linkValue || null;
    const tags: string[] = [...itemTags];

    try {
      const wishlistItem: WishlistItemInterface = (await addWishlistItemService({ wishlistId, title, description, link, tags })).data;
      setWishlistItems((prev) => [...prev, wishlistItem]);

      displayPopupMessage('Item added.', 'success');
      clearForm();

      onFinish();
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
        // errReason === 'duplicateItemTitle'
        // TODO: fix
        return;
      }

      if (!errReason || ![400, 409].includes(status)) {
        return;
      }

      const setErrorMessage: ((errMessage: string | null) => void) | undefined = addWishlistItemErrFieldRecord[errReason];
      setErrorMessage && setErrorMessage(errMessage);
    }
  }

  async function editWishlistItem(): Promise<void> {
    // TODO: continue implementation
  }

  const addWishlistItemErrFieldRecord: Record<string, (errorMessage: string | null) => void> = useMemo(
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

  function changesDetected(): boolean {
    if (!wishlistItem) {
      return false;
    }

    if (titleValue !== wishlistItem.title) {
      return true;
    }

    if (linkValue !== wishlistItem.link) {
      return true;
    }

    if (descriptionValue !== wishlistItem.description) {
      return true;
    }

    if (itemTags.size !== wishlistItem.tags.length) {
      return true;
    }

    for (const { name } of wishlistItem.tags) {
      if (!itemTags.has(name)) {
        return true;
      }
    }

    return false;
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
    <form
      className='wishlist-item-form'
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();

        if (isSubmitting || !allFieldsValid()) {
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
            clearForm();
            onFinish();
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
  );
}
