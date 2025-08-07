import { JSX, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './App.css';

export default function App(): JSX.Element {
  return (
    <>
      <nav></nav>
      <Outlet />
    </>
  );
}
