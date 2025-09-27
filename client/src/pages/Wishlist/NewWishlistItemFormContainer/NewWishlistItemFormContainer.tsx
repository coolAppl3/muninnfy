import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItemForm from '../components/WishlistItemForm';
import ChevronIcon from '../../../assets/svg/ChevronIcon.svg?react';

export default function NewWishlistItemFormContainer(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <section className='new-wishlist-item-form-container relative z-0'>
      <Container>
        <div className={`inner-container rounded-sm bg-secondary shadow-simple-tiny ${isExpanded ? 'expanded' : ''}`}>
          <button
            className='header w-full flex justify-between items-center p-2 bg-secondary text-title transition-[filter_colors] hover:brightness-110 hover:text-cta cursor-pointer border-b-1 border-b-secondary rounded-sm'
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <h4 className='font-medium'>New wishlist item</h4>
            <ChevronIcon className='w-[1.6rem] h-[1.6rem]' />
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
