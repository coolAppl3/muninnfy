import { JSX, ReactNode } from 'react';

export default function PopupMessage({ children, type }: { children: ReactNode; type: 'success' | 'error' }): JSX.Element {
  return (
    <div className='fixed top-8 left-0 right-0 mx-auto z-35 flex justify-center items-center w-fit'>
      <span
        className={`py-1 px-[1.4rem] mx-2 w-fit max-w-[32rem] rounded shadow-simple-tiny text-sm font-bold text-center text-dark opacity-0 transition-[transform_opacity] animate-slide-up ${
          type === 'success' ? 'bg-success border-success' : 'bg-danger-popup border-danger'
        }`}
      >
        {children}
      </span>
    </div>
  );
}
