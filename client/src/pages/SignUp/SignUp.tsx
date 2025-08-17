import { ChangeEvent, FormEvent, JSX, useReducer, useState } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { DefaultFormGroup, PasswordFormGroup } from '../../components/FormGroups/FormGroups';
import Button from '../../components/Button/Button';
import { initialSignUpFormValidationState, signUpFormValidationReducer } from './signUpFormValidationReducer';

interface FormState {
  isSubmitting: boolean;
}

export default function SignUp(): JSX.Element {
  const [{ formData, formErrors }, dispatch] = useReducer(signUpFormValidationReducer, initialSignUpFormValidationState);
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
  });

  async function handleSubmit(): Promise<void> {
    // TODO: implement
  }

  return (
    <>
      <Head title='Sign Up - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2  bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <h1 className='text-title text-xl 3xs:text-2xl font-bold text-center'>Sign up to Muninnfy</h1>
            <div className='h-line my-2'></div>

            <form
              id='sign-up-form'
              className='grid grid-cols-1 gap-2'
              onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (formState.isSubmitting) {
                  return;
                }

                await handleSubmit();
              }}
            >
              <DefaultFormGroup
                id='displayName'
                label='Display name'
                autoComplete='name'
                value={formData.displayName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_FIELD', payload: e })}
                errorMessage={formErrors.displayName}
              />

              <DefaultFormGroup
                id='username'
                label='Username'
                autoComplete='username'
                value={formData.username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_FIELD', payload: e })}
                errorMessage={formErrors.username}
              />

              <DefaultFormGroup
                id='email'
                label='Email address'
                autoComplete='email'
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_FIELD', payload: e })}
                errorMessage={formErrors.email}
              />

              <PasswordFormGroup
                id='password'
                label='Password'
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_FIELD', payload: e })}
                errorMessage={formErrors.password}
              />

              <PasswordFormGroup
                id='confirmPassword'
                label='Confirm password'
                value={formData.confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_FIELD', payload: e })}
                errorMessage={formErrors.confirmPassword}
              />

              <Button
                className='bg-cta border-cta w-full'
                isSubmitBtn={true}
              >
                Submit
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
