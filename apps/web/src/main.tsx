import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/legacy.css';
import { migrateFromLocalforage } from './db/dexie/migrateFromLocalforage';

function mount() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename="/ayekta-emr">
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

void migrateFromLocalforage()
  .catch((e) => console.error('Legacy IndexedDB migration failed:', e))
  .finally(mount);
