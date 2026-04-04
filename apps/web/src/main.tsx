import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/legacy.css';
import { migrateFromLocalforage } from './db/dexie/migrateFromLocalforage';
import { queryClient } from './query/queryClient';

function mount() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {/* basename must match vite `base` / PWA start_url — see docs/v2/github-pages-offline-pwa.md */}
        <BrowserRouter basename="/ayekta-emr">
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

void migrateFromLocalforage()
  .catch((e) => console.error('Legacy IndexedDB migration failed:', e))
  .finally(mount);
