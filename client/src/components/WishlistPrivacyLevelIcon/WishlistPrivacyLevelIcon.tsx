import { JSX } from 'react';
import { FOLLOWERS_WISHLIST_PRIVACY_LEVEL, PRIVATE_WISHLIST_PRIVACY_LEVEL } from '../../utils/constants/wishlistConstants';
import LockIcon from '../../assets/svg/LockIcon.svg?react';
import PersonIcon from '../../assets/svg/PersonIcon.svg?react';
import EyeIcon from '../../assets/svg/EyeIcon.svg?react';

export default function WishlistPrivacyLevelIcon({ privacyLevel }: { privacyLevel: number }): JSX.Element {
  const className = 'w-2 h-2';

  if (privacyLevel === PRIVATE_WISHLIST_PRIVACY_LEVEL) {
    return (
      <span
        title='Private'
        aria-label='Private wishlist'
      >
        <LockIcon className={className} />
      </span>
    );
  }

  if (privacyLevel === FOLLOWERS_WISHLIST_PRIVACY_LEVEL) {
    return (
      <span
        title='Followers'
        aria-label='Followers only wishlist'
      >
        <PersonIcon className={className} />
      </span>
    );
  }

  return (
    <span
      title='Public'
      aria-label='Public wishlist'
    >
      <EyeIcon className={className} />
    </span>
  );
}
