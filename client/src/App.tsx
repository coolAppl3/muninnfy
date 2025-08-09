import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Navbars from './components/Navbars/Navbars';

export default function App(): JSX.Element {
  return (
    <>
      <Navbars></Navbars>
      <Outlet />
    </>
  );
}
