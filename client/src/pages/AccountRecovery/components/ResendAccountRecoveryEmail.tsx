import { JSX, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';

export default function ResendAccountRecoveryEmail(): JSX.Element {
  const [title, setTitle] = useState<string>('Account recovery in progress.');
  const [description, setDescription] = useState<string>('Check your inbox for a recovery email and click the link to continue.');

  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <h4 className='text-title font-medium mb-1'>{title}</h4>
      <p className='text-description text-sm mb-2'>{description}</p>
      <Button
        className='bg-description border-description text-dark w-full'
        disabled={btnDisabled}
        onClick={async () => {
          if (btnNavigateLocation) {
            navigate(btnNavigateLocation);
            return;
          }

          // TODO: continue implementation
        }}
      >
        {btnTitle}
      </Button>
    </>
  );
}
