import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application Crash:", error);
  // Render a fallback error message directly to the DOM so the screen isn't just black
  rootElement.innerHTML = `
    <div style="background-color: #000; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; padding: 20px; text-align: center;">
      <h2 style="color: #f97316; font-size: 24px; margin-bottom: 16px;">System Error</h2>
      <p style="color: #a1a1aa; max-width: 400px; margin-bottom: 24px;">The application failed to start.</p>
      <pre style="background: #18181b; padding: 16px; border-radius: 8px; color: #ef4444; font-size: 12px; overflow: auto; max-width: 90vw; text-align: left;">${error instanceof Error ? error.message : 'Unknown Error'}</pre>
    </div>
  `;
}