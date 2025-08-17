import { JSX, useEffect } from 'react';
import { Location, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Navbars from './components/Navbars/Navbars';
import Footer from './components/Footer/Footer';

export default function App(): JSX.Element {
  const { pathname }: Location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbars />
      <Outlet />
      <Footer />
    </>
  );
}
