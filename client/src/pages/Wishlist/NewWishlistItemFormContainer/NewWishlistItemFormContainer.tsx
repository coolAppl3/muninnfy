import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import Button from '../../../components/Button/Button';
import WishlistItemForm from '../components/WishlistItemForm';

export default function NewWishlistItemFormContainer(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <section className='wishlist-item-form-container'>
      <Container>
        <div className={`inner-container ${isExpanded ? 'expanded' : ''}`}>
          <Button
            className='expand-form-btn bg-cta border-cta w-full sm:w-fit h-fit'
            onClick={() => setIsExpanded(true)}
          >
            New wishlist item
          </Button>

          {isExpanded && (
            <WishlistItemForm
              formMode='NEW_ITEM'
              onFinish={() => setIsExpanded(false)}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
