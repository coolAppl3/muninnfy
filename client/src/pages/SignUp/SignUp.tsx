import { ChangeEvent, FormEvent, JSX, useReducer, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import Button from '../../components/Button/Button';
import signUpFormValidationReducer, { initialSignUpFormValidationState } from './signUpFormValidationReducer';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import { signUpService } from '../../services/accountServices';
import usePopupMessage from '../../hooks/usePopupMessage';
import PasswordFormGroup from '../../components/PasswordFormGroup/PasswordFormGroup';
import DefaultFormGroup from '../../components/DefaultFormGroup/DefaultFormGroup';
import useAuth from '../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';

export default function SignUp(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const [{ formData, formErrors }, dispatch] = useReducer(signUpFormValidationReducer, initialSignUpFormValidationState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function handleSubmit(): Promise<void> {
    const { displayName, username, email, password } = formData;

    try {
      const publicAccountId: string = (await signUpService({ displayName, username, email, password })).data.publicAccountId;
      navigate(`/sign-up/verification?publicAccountId=${publicAccountId}`);

      displayPopupMessage('Account created.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 403) {
        setAuthStatus('authenticated');
        return;
      }

      if (status === 400 || status === 409) {
        errReason && dispatch({ type: 'ADD_FIELD_ERROR', payload: { errMessage, errReason } });
      }
    }
  }

  function allFieldsValid(): boolean {
    dispatch({ type: 'VALIDATE_ALL_FIELDS', payload: null });
    const newState = signUpFormValidationReducer({ formData, formErrors }, { type: 'VALIDATE_ALL_FIELDS', payload: null });

    for (const errorMessage of Object.values(newState.formErrors)) {
      if (errorMessage) {
        displayPopupMessage(errorMessage, 'error');
        return false;
      }
    }

    return true;
  }

  return (
    <>
      <Head title='Sign Up - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <h1 className='text-title text-xl 3xs:text-2xl font-bold mb-[1.6rem]'>Sign up to Muninnfy</h1>

            <form
              id='sign-up-form'
              className='grid grid-cols-1 gap-2 mb-2'
              onSubmit={async (e: FormEvent) => {
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
                id='displayName'
                label='Display name'
                autoComplete='name'
                value={formData.displayName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'VALIDATE_FIELD', payload: e })}
                errorMessage={formErrors.displayName}
              />

              <DefaultFormGroup
                id='username'
                label='Username'
                autoComplete='username'
                value={formData.username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'VALIDATE_FIELD', payload: e })}
                errorMessage={formErrors.username}
              />

              <DefaultFormGroup
                id='email'
                label='Email address'
                autoComplete='email'
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'VALIDATE_FIELD', payload: e })}
                errorMessage={formErrors.email}
              />

              <PasswordFormGroup
                id='password'
                label='Password'
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'VALIDATE_FIELD', payload: e })}
                errorMessage={formErrors.password}
              />

              <PasswordFormGroup
                id='confirmPassword'
                label='Confirm password'
                value={formData.confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'VALIDATE_FIELD', payload: e })}
                errorMessage={formErrors.confirmPassword}
              />

              <Button
                className='bg-cta border-cta w-full'
                isSubmitBtn
              >
                Submit
              </Button>
            </form>

            <div className='text-description text-sm'>
              <p className='mb-1'>
                Already have an account?{' '}
                <Link
                  to='/sign-in'
                  className='link'
                >
                  Sign in
                </Link>{' '}
                instead.
              </p>
              <p>
                Trying to verify your account?{' '}
                <Link
                  to='/sign-up/verification'
                  className='link'
                >
                  Continue your account verification
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
