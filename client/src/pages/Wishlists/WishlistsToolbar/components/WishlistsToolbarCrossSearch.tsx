import { Dispatch, FormEvent, JSX, SetStateAction, useState } from 'react';
import Button from '../../../../components/Button/Button';
import useWishlists from '../../hooks/useWishlists';
import { crossWishlistSearchService } from '../../../../services/wishlistServices';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import DefaultFormGroup from '../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateWishlistTitle } from '../../../../utils/validation/wishlistValidation';

type WishlistsToolbarCrossSearchProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistsToolbarCrossSearch({ isOpen, setIsOpen }: WishlistsToolbarCrossSearchProps): JSX.Element {
  const { wishlistsFilterConfig, setWishlistsFilterConfig } = useWishlists();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryErrorMessage, setSearchQueryErrorMessage] = useState<string | null>(null);

  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function crossWishlistSearch(): Promise<void> {
    displayLoadingOverlay();

    try {
      const wishlistIdsArr: string[] = (await crossWishlistSearchService(searchQuery)).data;
      displayPopupMessage('Query applied.', 'success');

      if (!changesDetected(wishlistIdsArr)) {
        return;
      }

      setWishlistsFilterConfig((prev) => ({
        ...prev,
        crossWishlistQueryIdSet: new Set<string>(wishlistIdsArr),
      }));
    } catch (err: unknown) {
      console.log(err);

      // TODO: continue implementation
    } finally {
      removeLoadingOverlay();
    }
  }

  function changesDetected(wishlistIdsArr: string[]): boolean {
    if (wishlistIdsArr.length !== wishlistsFilterConfig.crossWishlistQueryIdSet.size) {
      return true;
    }

    return wishlistIdsArr.some((id: string) => !wishlistsFilterConfig.crossWishlistQueryIdSet.has(id));
  }

  function clearSearchQuery(): void {
    setSearchQuery('');
    setSearchQueryErrorMessage(null);

    setWishlistsFilterConfig((prev) => ({
      ...prev,
      crossWishlistQueryIdSet: new Set<string>(),
    }));
  }

  return (
    <form
      className={`grid gap-2 bg-secondary p-2 rounded-sm shadow-simple-tiny mb-2 ${isOpen ? 'block' : 'hidden'}`}
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        await crossWishlistSearch();
      }}
    >
      <h4 className='text-title'>Cross-wishlist search</h4>

      <DefaultFormGroup
        id='cross-wishlists-search'
        label='Wishlist item title'
        autoComplete='off'
        value={searchQuery}
        errorMessage={searchQueryErrorMessage}
        onChange={(e) => {
          const newValue: string = e.target.value;
          const newErrorMessage: string | null = validateWishlistTitle(newValue);

          setSearchQuery(newValue);
          setSearchQueryErrorMessage(newErrorMessage);
        }}
      />

      <div className='btn-container flex flex-col sm:flex-row justify-start items-start gap-1'>
        <Button
          className='bg-cta border-cta w-full sm:w-fit order-1 sm:order-3'
          disabled={searchQuery === '' || searchQueryErrorMessage !== null}
          isSubmitBtn={true}
        >
          Search
        </Button>

        <Button
          className='bg-secondary border-title text-title w-full sm:w-fit order-2'
          onClick={() => setIsOpen(false)}
        >
          Close
        </Button>

        <Button
          className='bg-description border-description w-full sm:w-fit order-3 sm:order-1 mt-1 sm:mt-0'
          onClick={clearSearchQuery}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
