import { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
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

export function Router(): JSX.Element {
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

        <Route
          path='/wishlist/view/:wishlistId'
          element={<ViewWishlist />}
        />
      </Route>
    </Routes>
  );
}
