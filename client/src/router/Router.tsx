import { JSX, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home/Home';
import SignUp from '../pages/SignUp/SignUp';
import SignIn from '../pages/SignIn/SignIn';
import NewWishlist from '../pages/NewWishlist/NewWishlist';
import Wishlists from '../pages/Wishlists/Wishlists';
import AccountVerification from '../pages/AccountVerification/AccountVerification';
import Account from '../pages/Account/Account';
import Wishlist from '../pages/Wishlist/Wishlist';
import ViewWishlist from '../pages/ViewWishlist/ViewWishlist';
import NotFound from '../pages/NotFound/NotFound';
import { AuthStatus } from '../contexts/AuthContext';
import useAuth from '../hooks/useAuth';
import useHistory from '../hooks/useHistory';

function AuthOnlyRoute({ authStatus, redirectTo = '/sign-in' }: { authStatus: AuthStatus; redirectTo?: string }): JSX.Element {
  const { setPostAuthNavigate } = useHistory();
  const { pathname, search } = useLocation();

  useEffect(() => {
    authStatus === 'unauthenticated' && setPostAuthNavigate(pathname + search);
  }, [authStatus, pathname, search, setPostAuthNavigate]);

  if (authStatus === 'loading') {
    return <>{/* TODO: implement loading skeleton */}</>;
  }

  if (authStatus === 'authenticated') {
    return <Outlet />;
  }

  return <Navigate to={redirectTo} />;
}

function NonAuthOnlyRoute({ authStatus, redirectTo = '/account' }: { authStatus: AuthStatus; redirectTo?: string }): JSX.Element {
  if (authStatus === 'loading') {
    return <>{/* TODO: implement loading skeleton */}</>;
  }

  if (authStatus === 'unauthenticated') {
    return <Outlet />;
  }

  return <Navigate to={redirectTo} />;
}

export function Router(): JSX.Element {
  const { authStatus } = useAuth();

  return (
    <Routes>
      <Route
        path='/'
        element={<App />}
      >
        <Route
          index
          element={<Home />}
        />

        <Route
          path='/home'
          element={<Home />}
        />

        {/* AUTH ONLY ROUTES */}
        <Route element={<AuthOnlyRoute authStatus={authStatus} />}>
          <Route
            path='/account'
            element={<Account />}
          />

          <Route
            path='/account/wishlists'
            element={<Wishlists />}
          />

          <Route
            path='/wishlist/new'
            element={<NewWishlist />}
          />

          <Route
            path='/wishlist/:wishlistId'
            element={<Wishlist />}
          />
        </Route>

        {/* NON AUTH ONLY ROUTES */}
        <Route element={<NonAuthOnlyRoute authStatus={authStatus} />}>
          <Route
            path='/sign-up'
            element={<SignUp />}
          />

          <Route
            path='/sign-up/verification'
            element={<AccountVerification />}
          />

          <Route
            path='/sign-in'
            element={<SignIn />}
          />
        </Route>

        <Route
          path='/wishlist/view/:wishlistId'
          element={<ViewWishlist />}
        />

        <Route
          path='*'
          element={<NotFound />}
        />
      </Route>
    </Routes>
  );
}
