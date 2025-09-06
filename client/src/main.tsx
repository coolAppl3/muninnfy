import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './router/Router';
import AuthProvider from './providers/AuthProvider';
import HistoryProvider from './providers/HistoryProvider';

const root: HTMLDivElement | null = document.querySelector('#root');

root &&
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <HistoryProvider>
            <Router />
          </HistoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
