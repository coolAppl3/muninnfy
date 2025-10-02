import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItemForm from '../components/WishlistItemForm';
import ChevronIcon from '../../../assets/svg/ChevronIcon.svg?react';

export default function NewWishlistItemFormContainer(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <section className='relative z-0'>
      <Container>
        <div className='rounded-sm bg-secondary shadow-simple-tiny'>
          <button
            type='button'
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`w-full flex justify-between items-center p-2 bg-secondary text-title transition-[filter_colors] hover:brightness-110 hover:text-cta cursor-pointer border-b-1 ${
              isExpanded ? 'border-b-light-gray rounded-bl-none rounded-br-none' : 'border-b-secondary rounded-sm'
            }`}
          >
            <h4 className='font-medium'>New wishlist item</h4>
            <ChevronIcon className={`w-[1.6rem] h-[1.6rem] ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <WishlistItemForm
              formMode='NEW_ITEM'
              onFinish={() => setIsExpanded(false)}
              className={isExpanded ? 'py-2' : ''}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
