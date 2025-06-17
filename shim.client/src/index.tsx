// ClientApp/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Using React 18+ client API
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root element from your public/index.html
const rootElement = document.getElementById('root');

if (rootElement) {
    // Create a root and render the App component
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Root element with ID 'root' not found in the document.");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
