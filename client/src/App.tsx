import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';

export default function App(): JSX.Element {
  return (
    <>
      <Navbar></Navbar>
      <Outlet />
    </>
  );
}
