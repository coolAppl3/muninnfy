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

interface RouteDetails {
  path: string;
  element: JSX.Element;
}

export function Router(): JSX.Element {
  const { authStatus } = useAuth();

  const authOnlyRoutes: RouteDetails[] = [
    { path: '/account', element: <Account /> },
    { path: '/account/wishlists', element: <Wishlists /> },
    { path: '/wishlist/new', element: <NewWishlist /> },
    { path: '/wishlist/:wishlistId', element: <Wishlist /> },
  ];

  const nonAuthOnlyRoutes: RouteDetails[] = [
    { path: '/sign-up', element: <SignUp /> },
    { path: '/sign-up/verification', element: <AccountVerification /> },
    { path: '/sign-in', element: <SignIn /> },
  ];

  const publicRoutes: RouteDetails[] = [
    { path: '/home', element: <Home /> },
    { path: '/wishlist/view/:wishlistId', element: <ViewWishlist /> },
    { path: '*', element: <NotFound /> },
  ];

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

        {/* auth-only routes */}
        <Route element={<AuthOnlyRoute authStatus={authStatus} />}>
          {authOnlyRoutes.map((route: RouteDetails) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* non-auth-only routes */}
        <Route element={<NonAuthOnlyRoute authStatus={authStatus} />}>
          {nonAuthOnlyRoutes.map((route: RouteDetails) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* public routes */}
        <Route
          path='/wishlist/view/:wishlistId'
          element={<ViewWishlist />}
        />

        {publicRoutes.map((route: RouteDetails) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    </Routes>
  );
}

function AuthOnlyRoute({ authStatus, redirectTo = '/sign-in' }: { authStatus: AuthStatus; redirectTo?: string }): JSX.Element {
  const { postAuthNavigate, setPostAuthNavigate } = useHistory();
  const { pathname, search } = useLocation();

  useEffect(() => {
    authStatus === 'unauthenticated' && setPostAuthNavigate(pathname + search);

    if (authStatus === 'authenticated' && pathname + search === postAuthNavigate) {
      setPostAuthNavigate(null);
    }
  }, [authStatus, pathname, search, postAuthNavigate, setPostAuthNavigate]);

  if (authStatus === 'loading') {
    return <>{/* TODO: implement loading skeleton */}</>;
  }

  if (authStatus === 'authenticated') {
    return <Outlet />;
  }

  return (
    <Navigate
      to={redirectTo}
      replace
    />
  );
}

function NonAuthOnlyRoute({ authStatus, redirectTo = '/account' }: { authStatus: AuthStatus; redirectTo?: string }): JSX.Element {
  const { postAuthNavigate } = useHistory();

  if (authStatus === 'loading') {
    return <>{/* TODO: implement loading skeleton */}</>;
  }

  if (authStatus === 'unauthenticated') {
    return <Outlet />;
  }

  if (postAuthNavigate) {
    return <Navigate to={postAuthNavigate}></Navigate>;
  }

  return (
    <Navigate
      to={redirectTo}
      replace
    />
  );
}
