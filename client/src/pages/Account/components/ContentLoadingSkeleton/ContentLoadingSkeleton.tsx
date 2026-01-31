import { JSX } from 'react';

type ContentLoadingSkeletonProps = {
  className?: string;
};

export default function ContentLoadingSkeleton({ className }: ContentLoadingSkeletonProps): JSX.Element {
  return (
    <div className={`grid gap-1 ${className || ''}`}>
      {Array.from({ length: 3 }).map((_, index: number) => (
        <div
          key={index}
          className={`${skeletonContainerClassname} grid gap-1`}
        >
          <div className={`${skeletonTextClassname} h-2 max-w-3/4`}></div>
          <div className={`${skeletonTextClassname} h-1 max-w-9/10`}></div>
          <div className={`${skeletonTextClassname} h-1 max-w-1/4`}></div>
        </div>
      ))}
    </div>
  );
}

const skeletonTextClassname: string = 'w-full bg-cta/15 rounded-pill animate-pulse';
const skeletonContainerClassname: string = 'bg-dark p-2 rounded-sm shadow-simple-tiny';
