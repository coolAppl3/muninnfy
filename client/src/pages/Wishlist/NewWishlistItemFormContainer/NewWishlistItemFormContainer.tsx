import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItemForm from '../components/WishlistItemForm';
import ChevronIcon from '../../../assets/svg/ChevronIcon.svg?react';

export default function NewWishlistItemFormContainer(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <section className='wishlist-item-form-container'>
      <Container>
        <div className={`inner-container ${isExpanded ? 'expanded' : ''}`}>
          <button
            className='header'
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <p>New wishlist item</p>
            <ChevronIcon />
          </button>

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
