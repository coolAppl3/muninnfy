import { JSX, useEffect } from 'react';
import { Location, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer/Footer';
import Providers from './Providers';
import TopNavbar from './components/TopNavbar/TopNavbar';
import BottomNavbar from './components/BottomNavbar/BottomNavbar';

export default function App(): JSX.Element {
  const { pathname }: Location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Providers>
      <TopNavbar />
      <BottomNavbar />
      <Outlet />
      <Footer />
    </Providers>
  );
}
