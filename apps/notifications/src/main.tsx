import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@pdm/shared/app';
import '@pdm/shared/styles.css';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders><App /></AppProviders>
  </StrictMode>,
);
