import { StrictMode } from 'react';
import AuthProvider from 'react-auth-kit/AuthProvider';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import store from './auth-config';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);