import { JSX } from 'react';
import Container from '../Container/Container';
import './LoadingSkeleton.css';

export default function LoadingSkeleton(): JSX.Element {
  return (
    <div className='loading-skeleton'>
      <Container>
        <div className='grid gap-2'>
          <div className='skeleton-container'>
            <div className='text max-w-1/3 mb-2'></div>
            <div className='text skinny mb-1'></div>
            <div className='text skinny max-w-2/3'></div>
          </div>

          <div className='skeleton-container'>
            <div className='text max-w-3/4 mb-2'></div>

            <div className='text skinny mb-1'></div>
            <div className='text skinny max-w-1/3 mb-2'></div>

            <div className='text skinny mb-1'></div>
            <div className='text skinny max-w-3/5 mb-2'></div>
          </div>

          <div className='skeleton-grid'>
            <div className='skeleton-container'>
              <div className='text skinny'></div>
              <div className='text extra-skinny'></div>
              <div className='text extra-skinny'></div>
            </div>

            <div className='skeleton-container'>
              <div className='text skinny'></div>
              <div className='text extra-skinny'></div>
              <div className='text extra-skinny'></div>
            </div>

            <div className='skeleton-container'>
              <div className='text skinny'></div>
              <div className='text extra-skinny'></div>
              <div className='text extra-skinny'></div>
            </div>

            <div className='skeleton-container'>
              <div className='text skinny'></div>
              <div className='text extra-skinny'></div>
              <div className='text extra-skinny'></div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
