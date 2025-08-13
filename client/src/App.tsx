import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Navbars from './components/Navbars/Navbars';
import Footer from './components/Footer/Footer';

export default function App(): JSX.Element {
  return (
    <>
      <Navbars />
      <Outlet />
      <Footer />
    </>
  );
}
