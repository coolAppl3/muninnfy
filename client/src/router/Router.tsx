import { JSX } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home/Home';
import SignUp from '../pages/SignUp/SignUp';
import SignIn from '../pages/SignIn/SignIn';

export function Router(): JSX.Element {
  return (
    <Routes>
      <Route
        path='/'
        element={<App />}
      ></Route>
    </Routes>
  );
}
