import { JSX } from 'react';
import Container from '../Container/Container';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/svg/Logo.svg?react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Footer(): JSX.Element {
  const { authStatus } = useAuth();

  return (
    <footer className='bg-dark py-4'>
      <Container>
        <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3'>
          <div>
            <Link to='/home'>
              <div className='w-fit flex justify-center items-center gap-1 mb-1 xs:mb-2'>
                <Logo className='w-3 h-3' />
                <h4 className='text-title font-bold text-xl'>Muninnfy</h4>
              </div>
            </Link>

            <p className='text-description font-medium'>Your wishlists, your way.</p>
          </div>

          <LinksContainer
            title='Pages'
            links={[
              { title: 'Home', path: '/home' },
              { title: 'New wishlist', path: authStatus === 'authenticated' ? '/wishlist/new' : '/guest/wishlist/new' },
              { title: 'Sign up', path: '/sign-up' },
              { title: 'Sign in', path: '/sign-in' },
            ]}
          />

          <LinksContainer
            title='Useful'
            links={[
              { title: 'Account recovery', path: '/account/recovery' },
              { title: 'FAQ', path: '/faq' },
            ]}
          />

          <LinksContainer
            title='Legal'
            links={[
              { title: 'Terms of Service', path: '/terms-of-service' },
              { title: 'Privacy Policy', path: '/privacy-policy' },
              { title: 'Cookie Policy', path: '/cookie-policy' },
            ]}
          />
        </div>
      </Container>
    </footer>
  );
}

type LinksContainerProps = {
  title: string;
  links: {
    title: string;
    path: string;
  }[];
};

function LinksContainer({ title, links }: LinksContainerProps): JSX.Element {
  return (
    <div>
      <h3 className='text-title text-lg font-medium mb-2'>{title}</h3>

      <ul className='text-description font-medium flex flex-col justify-center items-start gap-[4px]'>
        {links.map((link: { title: string; path: string }) => (
          <li key={`${link.title}-${link.path}`}>
            <NavLink
              to={link.path}
              className='transition-colors hover:text-cta'
            >
              {link.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
