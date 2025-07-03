import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import AuthProvider from 'react-auth-kit/AuthProvider';
import store from './auth-config';
import { ThemeProvider } from './contexts/ThemeContext';
import i18n from './i18n';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper = options?.wrapper || AllTheProviders;
  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render }; 