import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import { AuthProvider } from './components/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "https://4afc4cdb3c12b6d10e358a1a5d4b2418@o4511906977742848.ingest.us.sentry.io/4511907062284288";

if (SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch (err) {
    console.warn('[SENTRY] Error initializing Sentry:', err);
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}