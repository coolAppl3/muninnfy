import { JSX } from 'react';
import Container from '../Container/Container';

export default function LoadingSkeleton(): JSX.Element {
  const textClassname: string = 'w-full bg-cta/15 rounded-pill animate-pulse';
  const skeletonContainerClassname: string = 'bg-dark p-2 rounded-sm shadow-simple-tiny';

  return (
    <div className='py-4'>
      <Container>
        <div className='grid gap-2'>
          <div className={skeletonContainerClassname}>
            <div className={`${textClassname} max-w-1/3 mb-2`}></div>
            <div className={`${textClassname} h-2 mb-1`}></div>
            <div className={`${textClassname} h-2 max-w-2/3`}></div>
          </div>

          <div className={skeletonContainerClassname}>
            <div className={`${textClassname} max-w-3/4 mb-2`}></div>

            <div className={`${textClassname} h-2 mb-1`}></div>
            <div className={`${textClassname} h-2 max-w-1/3 mb-2`}></div>

            <div className={`${textClassname} h-2 mb-1`}></div>
            <div className={`${textClassname} h-2 max-w-3/5 mb-2`}></div>
          </div>

          <div className='grid grid-cols-2 gap-1'>
            {Array.from({ length: 4 }).map((_, index: number) => (
              <div
                key={index}
                className={`${skeletonContainerClassname} grid gap-1`}
              >
                <div className={`${textClassname} h-2 max-w-3/4`}></div>
                <div className={`${textClassname} h-1 max-w-9/10`}></div>
                <div className={`${textClassname} h-1 max-w-1/4`}></div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
