import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Initializes and renders the React application.
 */
function main() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Fatal Error: Could not find the root element to mount the application to.");
    // Optionally, display a message to the user in the UI
    document.body.innerHTML = '<div style="text-align: center; margin-top: 50px; font-family: sans-serif;"><h1>Application Error</h1><p>Could not start the application. The main container is missing.</p></div>';
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Ensures that the script runs only after the entire DOM is parsed and ready.
// This is a robust way to prevent errors from trying to access DOM elements that haven't been created yet.
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', main);
} else {
    // DOM is already ready
    main();
}
