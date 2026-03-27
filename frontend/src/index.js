import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Load Chart.js from CDN
const chartScript = document.createElement('script');
chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
document.head.appendChild(chartScript);

// Google Fonts
const fontLink = document.createElement('link');
fontLink.rel  = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@500;600&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap';
document.head.appendChild(fontLink);

// Global base styles — uses CSS variables set by App.jsx
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }

  body {
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    transition: background 0.2s, color 0.2s;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  *, *::before, *::after {
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
  }

  [style*="animation"] {
    transition: none !important;
  }

  input, select, button, textarea {
    font-family: inherit;
  }
  button { cursor: pointer; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);