import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './router/Router';
import AuthProvider from './providers/AuthProvider';
import HistoryProvider from './providers/HistoryProvider';

const root: HTMLDivElement | null = document.querySelector('#root');

root &&
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <HistoryProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </HistoryProvider>
      </BrowserRouter>
    </StrictMode>
  );
