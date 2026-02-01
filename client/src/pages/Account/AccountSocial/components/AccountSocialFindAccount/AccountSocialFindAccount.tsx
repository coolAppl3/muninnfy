import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSocialFindQuery } from '../../../../../utils/validation/socialValidation';
import Button from '../../../../../components/Button/Button';
import { findAccountsService } from '../../../../../services/socialServices';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import ContentLoadingSkeleton from '../../../components/ContentLoadingSkeleton/ContentLoadingSkeleton';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import AccountLinkCard from './components/AccountLinkCard';
import { BasicSocialData } from '../../../../../types/socialTypes';

export default function AccountSocialFindAccount(): JSX.Element {
  const [results, setResults] = useState<BasicSocialData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firstSearchCompleted, setFirstSearchCompleted] = useState<boolean>(false);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');

  const isIdenticalSearchQuery: boolean = value === lastSearchQuery;

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();

  async function findAccounts(): Promise<void> {
    const searchQuery: string = value;

    try {
      const fetchedResults: BasicSocialData[] = (await findAccountsService(searchQuery)).data;
      setResults(fetchedResults);

      setLastSearchQuery(searchQuery);
      firstSearchCompleted || setFirstSearchCompleted(true);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        setErrorMessage(errMessage);
      }
    }
  }

  return (
    <>
      <div className='h-line my-1'></div>

      <form
        className='grid gap-2'
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting || isIdenticalSearchQuery) {
            return;
          }

          const newErrorMessage: string | null = validateSocialFindQuery(value);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          setIsSubmitting(true);
          await findAccounts();

          setIsSubmitting(false);
        }}
      >
        <DefaultFormGroup
          id='find-users'
          label='Find users'
          autoComplete='off'
          placeholder='Username or account ID'
          value={value}
          errorMessage={errorMessage}
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value.toLowerCase();
            const newErrorMessage: string | null = validateSocialFindQuery(newValue);

            setValue(newValue);
            setErrorMessage(newErrorMessage);
          }}
        />

        <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
          <Button
            isSubmitBtn
            disabled={isIdenticalSearchQuery || errorMessage !== null}
            className='bg-description border-description text-dark order-1 sm:order-2 w-full sm:w-fit'
          >
            Search
          </Button>
        </div>
      </form>

      {isSubmitting ? (
        <ContentLoadingSkeleton className='mt-2' />
      ) : (
        <>
          {firstSearchCompleted && (
            <>
              <div className='h-line my-2'></div>
              {results.length === 0 && <p className='text-sm text-description w-fit mx-auto'>No users found</p>}
            </>
          )}
          <div className='grid gap-1 sm:grid-cols-2'>
            {results.map((account: BasicSocialData) => (
              <AccountLinkCard
                key={account.public_account_id}
                account={account}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
