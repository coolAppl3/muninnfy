import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import { App } from './App';

const root: HTMLDivElement | null = document.querySelector('#root');

root &&
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
