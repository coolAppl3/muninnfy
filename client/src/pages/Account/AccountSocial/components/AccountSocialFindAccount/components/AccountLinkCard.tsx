import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { BasicSocialData } from '../../../../../../types/socialTypes';

type AccountLinkCardProps = {
  account: BasicSocialData;
};

export default function AccountLinkCard({ account }: AccountLinkCardProps): JSX.Element {
  const { public_account_id, username, display_name } = account;

  return (
    <Link
      to={`/account/view/${public_account_id}`}
      className='p-1 bg-primary rounded text-description text-sm overflow-hidden min-w-0 transition-[filter] hover:brightness-75'
    >
      <p className='text-title font-medium leading-[1] max-w-full truncate mb-[4px]'>@{username}</p>
      <p className='block text-description/70 leading-[1] max-w-full truncate'>{display_name}</p>
    </Link>
  );
}
