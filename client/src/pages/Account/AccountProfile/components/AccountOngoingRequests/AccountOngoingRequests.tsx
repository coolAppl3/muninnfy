import { JSX } from 'react';
import useAccountOngoingRequests from '../../../hooks/useAccountOngoingRequests';
import ArrowIcon from '../../../../../assets/svg/ArrowIcon.svg?react';

export default function AccountOngoingRequests(): JSX.Element {
  const { ongoingEmailUpdateRequest, ongoingAccountDeletionRequest } = useAccountOngoingRequests();

  if (!ongoingEmailUpdateRequest && !ongoingAccountDeletionRequest) {
    return <></>;
  }

  return (
    <div>
      <div className='h-line mt-2 mb-[1rem]'></div>
      <h3 className='text-md text-title font-normal mb-1'>Ongoing requests</h3>

      <div className='grid gap-y-[4px] text-description text-sm font-medium'>
        {[ongoingEmailUpdateRequest, ongoingAccountDeletionRequest].map((request, index: number) =>
          !request ? null : (
            <div
              key={index}
              className='flex justify-between items-center p-1 bg-dark rounded'
            >
              <p className='leading-[1]'>{index === 0 ? 'Email update' : 'Account deletion'}</p>

              <button
                type='button'
                title='View'
                aria-label='View request'
                className='ml-1 bg-cta/10 text-title px-[2.4rem] h-[2.8rem] rounded-pill flex justify-center items-center transition-colors hover:bg-cta/5 hover:text-cta cursor-pointer'
                onClick={() => {
                  // TODO: continue implementation
                }}
              >
                <ArrowIcon className='w-[1.6rem] h-[1.6rem]' />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
