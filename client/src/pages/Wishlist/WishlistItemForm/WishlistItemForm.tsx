import { ChangeEvent, FormEvent, JSX, useState } from 'react';
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

export default function WishlistItemForm(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const [descriptionValue, setDescriptionValue] = useState<string>('');
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string | null>(null);

  const [linkValue, setLinkValue] = useState<string>('');
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);

  const [itemTags, setItemTags] = useState<Set<string>>(new Set());

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
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
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
                onClick={() => setIsExpanded(false)}
              >
                Collapse
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
