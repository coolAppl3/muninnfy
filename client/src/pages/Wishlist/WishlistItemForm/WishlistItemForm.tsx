import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import TextareaFormGroup from '../../../components/FormGroups/TextareaFormGroup';
import Button from '../../../components/Button/Button';
import WishlistItemTagsFormGroup from '../components/WishlistItemTagsFormGroup';
import DefaultFormGroup from '../../../components/FormGroups/DefaultFormGroup';

export default function WishlistItemForm(): JSX.Element {
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
        <div className='wishlist-item-form-container'>
          <Button className='bg-cta border-cta ml-auto'>New wishlist item</Button>

          <form onSubmit={(e: FormEvent) => e.preventDefault()}>
            <DefaultFormGroup
              id='item-title'
              label='Title'
              autoComplete='off'
              value={titleValue}
              errorMessage={titleErrorMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newValue: string = e.target.value;

                setTitleValue(newValue);
                // TODO: validate
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
                // TODO: validate
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
                // TODO: validate
              }}
            />
          </form>
        </div>
      </Container>
    </section>
  );
}
