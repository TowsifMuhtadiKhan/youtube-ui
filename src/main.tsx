import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Capacitor } from '@capacitor/core';

async function startApp() {
  // Older Android builds registered the website's service worker. Remove it
  // when upgrading so it cannot serve a previous bundle over the packaged app.
  if (Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length) {
        await Promise.all(registrations.map(registration => registration.unregister()));
        if ('caches' in window) {
          await Promise.all((await caches.keys()).map(key => caches.delete(key)));
        }
        if (navigator.serviceWorker.controller) {
          window.location.reload();
          return;
        }
      }
    } catch (error) {
      console.warn('Could not clear the previous Android web cache.', error);
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void startApp();
