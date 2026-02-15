import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initFCM } from './utils/fcm';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Initialize FCM. Note: If user-specific data is needed for initFCM,
// it should be called after user authentication/data is available,
// potentially within a component or a useEffect hook.
// For a global, non-user-specific initialization, calling it here is appropriate.
initFCM();

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);