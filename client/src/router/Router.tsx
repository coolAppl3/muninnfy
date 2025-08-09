import { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home/Home';
import SignUp from '../pages/SignUp/SignUp';
import SignIn from '../pages/SignIn/SignIn';
import NewWishlist from '../pages/NewWishlist/NewWishlist';
import Wishlists from '../pages/Wishlists/Wishlists';

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
          path='/sign-in'
          element={<SignIn />}
        />
        <Route
          path='/sign-ip'
          element={<SignUp />}
        />

        <Route
          path='/new-wishlist'
          element={<NewWishlist />}
        />
        <Route
          path='/wishlists'
          element={<Wishlists />}
        />
      </Route>
    </Routes>
  );
}
