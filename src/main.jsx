import './polyfills.js'; // Add this line at the very top
import React from 'react';
import ReactDOM from 'react-dom/client';
import PumpSelectionApp from './App';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PumpSelectionApp />
  </React.StrictMode>
);
