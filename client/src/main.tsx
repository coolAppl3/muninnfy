import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './router/Router';

const root: HTMLDivElement | null = document.querySelector('#root');

root &&
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </StrictMode>
  );
