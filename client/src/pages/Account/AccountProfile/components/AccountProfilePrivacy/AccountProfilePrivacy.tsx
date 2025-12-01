import { JSX } from 'react';
import ToggleSwitch from '../../../../../components/ToggleSwitch/ToggleSwitch';
import Button from '../../../../../components/Button/Button';

export default function AccountProfilePrivacy(): JSX.Element {
  return (
    <div className='grid gap-1'>
      <h3 className='text-md text-title font-normal'>Privacy</h3>

      <div className='grid gap-y-[4px] text-description text-sm font-medium'>
        <div className='flex justify-between items-center p-1 bg-dark rounded'>
          <p>Private account</p>
          <ToggleSwitch
            isToggled={true}
            onClick={() => {}}
          />
        </div>

        <div className='flex justify-between items-center p-1 bg-dark rounded'>
          <p>Approve followers</p>
          <ToggleSwitch
            isToggled={true}
            onClick={() => {}}
          />
        </div>
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-start items-center gap-1'>
        <Button className='bg-cta border-cta text-dark w-full sm:w-fit order-1 sm:order-2'>Save</Button>
        <Button className='bg-secondary border-title text-title w-full sm:w-fit order-2 sm:order-1'>Cancel</Button>
      </div>
    </div>
  );
}
