import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import DefaultFormGroup from '../../components/FormGroups/DefaultFormGroup';
import Button from '../../components/Button/Button';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import PasswordFormGroup from '../../components/FormGroups/PasswordFormGroup';
import { validateEmail, validatePassword } from '../../utils/validation/userValidation';
import CheckboxFormGroup from '../../components/FormGroups/CheckboxFormGroup';
import usePopupMessage from '../../hooks/usePopupMessage';
import { signInService } from '../../services/accountServices';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import useInfoModal from '../../hooks/useInfoModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import useAuth from '../../hooks/useAuth';

export default function SignIn(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [emailValue, setEmailValue] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [keepSignedInValue, setKeepSignedIn] = useState<boolean>(false);

  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayInfoModal } = useInfoModal();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const { setIsSignedIn } = useAuth();

  async function handleSubmit(): Promise<void> {
    const email: string = emailValue;
    const password: string = passwordValue;
    const keepSignedIn: boolean = keepSignedInValue;

    try {
      await signInService({ email, password, keepSignedIn });
      setIsSignedIn(true);

      displayPopupMessage('Signed in.', 'success');
      navigate('/account');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (!errReason) {
        return;
      }

      if ([400, 401, 404].includes(status)) {
        const stateSetter: ((errorMessage: string | null) => void) | undefined = errFieldRecord[errReason];
        stateSetter && stateSetter(errMessage);

        return;
      }

      if (status !== 403) {
        return;
      }

      if (errReason === 'alreadySignedIn') {
        setIsSignedIn(true);
        displayInfoModal({
          title: errMessage,
          btnTitle: 'Go to my account',
          onClick: () => navigate('/account'),
        });

        return;
      }

      if (errReason === 'accountLocked') {
        displayConfirmModal({
          title: errMessage,
          description: 'You can regain access by following the account recovery process.',
          confirmBtnTitle: 'Proceed',
          cancelBtnTitle: 'Go to homepage',
          isDangerous: false,
          onConfirm: () => navigate('/account/recovery'),
          onCancel: removeConfirmModal,
        });
      }
    }
  }

  function allFieldsValid(): boolean {
    const newEmailErrorMessage: string | null = validateEmail(emailValue);
    const newPasswordErrorMessage: string | null = validatePassword(passwordValue);

    setEmailErrorMessage(newEmailErrorMessage);
    setPasswordErrorMessage(newPasswordErrorMessage);

    for (const errorMessage of [newEmailErrorMessage, newPasswordErrorMessage]) {
      if (errorMessage) {
        displayPopupMessage(errorMessage, 'error');
        return false;
      }
    }

    return true;
  }

  const errFieldRecord: Record<string, (errorMessage: string | null) => void> = {
    invalidEmail: setEmailErrorMessage,
    accountNotFound: setEmailErrorMessage,

    invalidPassword: setPasswordErrorMessage,
    incorrectPassword_locked: setPasswordErrorMessage,
    incorrectPassword: setPasswordErrorMessage,
  };

  return (
    <>
      <Head title='Sign In - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <h1 className='text-title text-xl 3xs:text-2xl font-bold text-center'>Sign in</h1>
            <div className='h-line my-2'></div>

            <form
              id='sign-up-form'
              className='grid grid-cols-1 gap-2 mb-2'
              onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (isSubmitting || !allFieldsValid()) {
                  return;
                }

                setIsSubmitting(true);
                displayLoadingOverlay();

                await handleSubmit();

                setIsSubmitting(false);
                removeLoadingOverlay();
              }}
            >
              <DefaultFormGroup
                id='email'
                label='Email address'
                autoComplete='email'
                value={emailValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newValue: string = e.target.value;

                  setEmailValue(newValue);
                  setEmailErrorMessage(validateEmail(newValue));
                }}
                errorMessage={emailErrorMessage}
              />

              <PasswordFormGroup
                id='password'
                label='Password'
                value={passwordValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newValue: string = e.target.value;

                  setPasswordValue(newValue);
                  setPasswordErrorMessage(validatePassword(newValue));
                }}
                errorMessage={passwordErrorMessage}
              />

              <CheckboxFormGroup
                label='Keep me signed in'
                id='keepSignedIn'
                isChecked={keepSignedInValue}
                onClick={() => setKeepSignedIn((prev) => !prev)}
              />

              <Button
                className='bg-cta border-cta w-full'
                isSubmitBtn={true}
              >
                Submit
              </Button>
            </form>

            <div className='text-description text-sm'>
              <p className='mb-1'>
                Forgot your password or locked your account?{' '}
                <Link
                  to='/account/recovery'
                  className='link'
                >
                  Start account recovery
                </Link>
                .
              </p>

              <p>
                Don't have an account?{' '}
                <Link
                  to='/sign-up'
                  className='link'
                >
                  Sign up
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
