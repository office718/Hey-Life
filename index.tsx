
import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { SetupRouter } from './App';
import { initializeAppIfNeeded } from './firebase/firebaseConfig';

// Extend the Window interface
declare global {
  interface Window {
    HEYCHURCH_APP_CONFIG?: {
      GEMINI_API_KEY: string;
      FIREBASE_CONFIG: any;
      YOUTUBE_API_KEY?: string;
      PAYPAL_CLIENT_ID?: string;
    };
    html2canvas?: any;
    deferredInstallPrompt?: any;
  }
}

// Handle PWA Installation Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later via a button in Settings.
  window.deferredInstallPrompt = e;
  // Dispatch a custom event so components know they can show the install button
  window.dispatchEvent(new Event('can-install-app'));
});

// Register Service Worker for PWA with Update Handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          };
        }
      };
    }).catch(err => {
      console.error('Service Worker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const result = initializeAppIfNeeded();

root.render(
  <React.StrictMode>
    {result.success ? <App /> : <SetupRouter error={result.error} source={result.source} />}
  </React.StrictMode>
);
