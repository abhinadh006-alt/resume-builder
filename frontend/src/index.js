import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1) Capture ?auth=... once and save it
(function seedAuthFromURL() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth");
  if (auth) {
    localStorage.setItem("RB_AUTH", auth);
    const { pathname, hash } = window.location;
    window.history.replaceState({}, "", pathname + (hash || ""));
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
