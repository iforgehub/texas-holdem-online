import 'core-js/es/map';
import 'core-js/es/set';
import 'raf/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Providers from './context/Providers';
import ErrorBoundary from './utils/errorBoundary';

const rootElement = document.getElementById('root');

// Show root element immediately
if (rootElement) {
  rootElement.style.display = 'block';
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Providers>
        <App />
      </Providers>
    </ErrorBoundary>
  </React.StrictMode>,
  rootElement,
);

  // Disable react dev tools in production
  if (
    process.env.NODE_ENV === 'production' &&
    typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object'
  ) {
    for (let [key, value] of Object.entries(
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    )) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
        typeof value == 'function' ? () => {} : null;
    }
  }