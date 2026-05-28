import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  const msg = event.message || event.error?.message || '';
  if (msg.includes('The fetching process for the media resource was aborted') ||
      msg.includes('The play() request was interrupted')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (msg.includes('The fetching process for the media resource was aborted') ||
      msg.includes('The play() request was interrupted')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
