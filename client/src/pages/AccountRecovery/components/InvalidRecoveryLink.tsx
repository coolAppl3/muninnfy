import { JSX } from 'react';
import Button from '../../../components/Button/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export function InvalidRecoveryLink(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <h4 className='text-title font-medium mb-1'>Invalid recovery link.</h4>
      <p className='text-description text-sm mb-2'>Check your inbox for a recovery email and make sure you click the link within.</p>
      <Button
        className='bg-description border-description text-dark w-full'
        onClick={async () => navigate('/home')}
      >
        Go to homepage
      </Button>
    </>
  );
}
