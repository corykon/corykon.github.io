import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';

import './reset.css';
import './styles.css';

// Load test functions in development
if (process.env.NODE_ENV === 'development') {
  import('./test-celebrations');
}

const root = createRoot(document.querySelector('#root'));
root.render(<App />);
