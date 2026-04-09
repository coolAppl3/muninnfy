import { JSX } from 'react';
import { NavLink } from 'react-router-dom';

export default function ArticlesNav(): JSX.Element {
  const styling: string =
    'block p-2 bg-secondary transition-[filter] hover:brightness-75 border-b-1 border-b-light-gray last:border-b-secondary';

  return (
    <nav className='hidden md:block col-span-4 rounded shadow-simple-tiny font-medium text-title sticky top-10'>
      <NavLink
        to={'/terms-of-service'}
        className={({ isActive }) => `${styling} ${isActive ? 'text-cta' : ''}`}
      >
        Terms of Service
      </NavLink>

      <NavLink
        to={'/privacy-policy'}
        className={({ isActive }) => `${styling} ${isActive ? 'text-cta' : ''}`}
      >
        Privacy Policy
      </NavLink>

      <NavLink
        to={'/cookie-policy'}
        className={({ isActive }) => `${styling} ${isActive ? 'text-cta' : ''}`}
      >
        Cookie Policy
      </NavLink>

      <NavLink
        to={'/faq'}
        className={({ isActive }) => `${styling} ${isActive ? 'text-cta' : ''}`}
      >
        FAQ
      </NavLink>
    </nav>
  );
}
