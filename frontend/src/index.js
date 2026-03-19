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

// Global styles
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: #070a10;
    color: #e8eaf0;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #0a0d14; }
  ::-webkit-scrollbar-thumb { background: #1e2230; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2a2f40; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  input, select, button { font-family: inherit; }
  button { cursor: pointer; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
