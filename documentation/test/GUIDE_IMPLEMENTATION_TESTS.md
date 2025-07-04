# Guide d'Implémentation des Tests - Démarrage Immédiat

## 🚀 Étapes pour Commencer Maintenant

### 1. Améliorer la Configuration Actuelle

#### **Modifier vitest.config.ts pour de meilleurs seuils**
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/test-utils.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      // 🎯 AMÉLIORATION : Définir des seuils progressifs
      thresholds: {
        global: {
          branches: 60,    // Commencer à 60%
          functions: 70,   // Objectif 70%
          lines: 65,       // Objectif 65%
          statements: 65   // Objectif 65%
        },
        // Seuils spécifiques par type
        'src/components/**/*': {
          branches: 70,
          functions: 80,
          lines: 75,
          statements: 75
        },
        'src/hooks/**/*': {
          branches: 80,
          functions: 85,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### **Améliorer setupTests.ts**
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 🔧 Configuration globale des mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock pour les APIs manquantes
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
  })),
  registerables: [],
}));

// Mock pour react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn().mockImplementation(({ data, options }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
  Bar: vi.fn().mockImplementation(({ data, options }) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

// Mock pour les modules de traduction
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'fr',
    },
  }),
}));

// Mock pour react-auth-kit
vi.mock('react-auth-kit', () => ({
  useAuthHeader: () => 'Bearer mock-token',
  useAuthUser: () => ({ id: 1, email: 'test@test.com' }),
  useIsAuthenticated: () => () => true,
  useSignOut: () => () => vi.fn(),
}));

// Console sans spam
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
```

### 2. Tests Prioritaires à Implémenter

#### **Test d'Intégration : AuthGuard**
```typescript
// src/components/AuthGuard/__tests__/AuthGuard.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthGuard } from '../AuthGuard';

// Mock react-auth-kit
vi.mock('react-auth-kit', () => ({
  useIsAuthenticated: vi.fn(),
}));

const MockedAuthGuard = ({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) => {
  const { useIsAuthenticated } = require('react-auth-kit');
  useIsAuthenticated.mockReturnValue(() => isAuthenticated);
  
  return (
    <BrowserRouter>
      <AuthGuard>{children}</AuthGuard>
    </BrowserRouter>
  );
};

describe('AuthGuard - Tests d\'intégration', () => {
  it('devrait rediriger vers login si non authentifié', () => {
    render(
      <MockedAuthGuard isAuthenticated={false}>
        <div>Contenu protégé</div>
      </MockedAuthGuard>
    );
    
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si authentifié', () => {
    render(
      <MockedAuthGuard isAuthenticated={true}>
        <div>Contenu protégé</div>
      </MockedAuthGuard>
    );
    
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });
});
```

#### **Test d'Intégration : Flux de Prédictions**
```typescript
// src/components/Predictions/__tests__/Predictions.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Predictions } from '../Predictions';

// Mock des hooks
vi.mock('../hooks/useCountries', () => ({
  useCountries: () => ({
    countries: [
      { id_country: 1, name: 'France', iso_code: 'FR' },
      { id_country: 2, name: 'Germany', iso_code: 'DE' },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('../hooks/usePredictions', () => ({
  usePredictions: () => ({
    predictions: null,
    loading: false,
    error: null,
    fetchPredictions: vi.fn(),
  }),
}));

describe('Predictions - Tests d\'intégration', () => {
  it('devrait permettre de sélectionner un pays et générer des prédictions', async () => {
    render(<Predictions />);
    
    // Vérifier les éléments de base
    expect(screen.getByText('Date de début')).toBeInTheDocument();
    expect(screen.getByText('Date de fin')).toBeInTheDocument();
    expect(screen.getByText('Pays')).toBeInTheDocument();
    
    // Sélectionner un pays
    const countrySelect = screen.getByRole('combobox');
    fireEvent.change(countrySelect, { target: { value: '1' } });
    
    // Remplir les dates
    const startDateInput = screen.getByLabelText(/date de début/i);
    const endDateInput = screen.getByLabelText(/date de fin/i);
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
    
    // Cliquer sur le bouton
    const submitButton = screen.getByRole('button', { name: /afficher les prédictions/i });
    fireEvent.click(submitButton);
    
    // Vérifier que la fonction est appelée
    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    });
  });
});
```

### 3. Scripts Package.json à Ajouter

```json
{
  "scripts": {
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "coverage:open": "vitest run --coverage && open coverage/index.html",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "quality": "npm run lint:check && npm run test",
    "format": "npm run lint:fix"
  }
}
```

### 4. Créer des Configs Séparées

#### **vitest.unit.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/**/*.integration.{test,spec}.{ts,tsx}'],
  },
});
```

#### **vitest.integration.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['src/**/*.integration.{test,spec}.{ts,tsx}'],
    timeout: 10000, // Plus de temps pour les tests d'intégration
  },
});
```

### 5. Utilitaires de Test

#### **src/test-utils.tsx - Améliorer**
```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Provider mockés
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Render personnalisé
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock factories
export const createMockUser = (overrides = {}) => ({
  id_user: 1,
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@who.int',
  isAdmin: false,
  ...overrides,
});

export const createMockCountry = (overrides = {}) => ({
  id_country: 1,
  name: 'France',
  iso_code: 'FR',
  population: '67000000',
  pib: '3000000000000',
  latitude: '46.2276',
  longitude: '2.2137',
  id_continent: 1,
  id_region: 1,
  ...overrides,
});

export const createMockPrediction = (overrides = {}) => ({
  id_country: 1,
  ds: '2024-01-01',
  yhat: 100,
  yhat_lower: 90,
  yhat_upper: 110,
  trend: 0.5,
  trend_lower: 0.4,
  trend_upper: 0.6,
  deaths: 10,
  deaths_lower: 8,
  deaths_upper: 12,
  pib: 1000000,
  pib_lower: 900000,
  pib_upper: 1100000,
  population: 1000000,
  population_lower: 950000,
  population_upper: 1050000,
  id_prediction: 1,
  id_disease: 1,
  ...overrides,
});

export * from '@testing-library/react';
export { customRender as render };
```

### 6. Actions Immédiates à Prendre

#### **Commandes à Exécuter**
```bash
# 1. Vérifier l'état actuel
npm run test
npm run coverage

# 2. Installer les dépendances manquantes (si nécessaire)
npm install -D @testing-library/jest-dom @testing-library/user-event

# 3. Exécuter les tests avec interface
npm run test:ui

# 4. Générer le rapport de couverture
npm run coverage
```

#### **Fichiers à Modifier en Priorité**
1. **vitest.config.ts** - Améliorer les seuils
2. **src/setupTests.ts** - Ajouter plus de mocks
3. **src/test-utils.tsx** - Améliorer les utilitaires
4. **package.json** - Ajouter les scripts

### 7. Prochaines Étapes (Semaine 1)

#### **Jour 1-2 : Configuration**
- [ ] Mettre à jour vitest.config.ts
- [ ] Améliorer setupTests.ts
- [ ] Créer les utilitaires de test

#### **Jour 3-4 : Tests Critiques**
- [ ] Améliorer les tests AuthGuard
- [ ] Créer tests d'intégration pour Predictions
- [ ] Tester les hooks principaux

#### **Jour 5 : Analyse et Amélioration**
- [ ] Exécuter le rapport de couverture
- [ ] Identifier les gaps
- [ ] Documenter les résultats

### 8. Métriques à Suivre

#### **Objectifs Semaine 1**
- **Couverture globale** : 65% → 70%
- **Tests d'intégration** : 3 nouveaux tests
- **Temps d'exécution** : < 20 secondes
- **Tests qui passent** : 100%

#### **Commandes de Monitoring**
```bash
# Suivre la couverture
npm run coverage

# Tests en mode watch
npm run test:watch

# Qualité globale
npm run quality

# Interface graphique
npm run test:ui
```

### 9. Dépannage Rapide

#### **Problèmes Courants**
- **Tests lents** : Vérifier les mocks et timeouts
- **Erreurs de rendu** : Améliorer les providers de test
- **Couverture faible** : Identifier les fichiers non testés
- **Erreurs de mock** : Vérifier setupTests.ts

#### **Solutions Rapides**
```typescript
// Mock d'un composant problématique
vi.mock('./ProblematicComponent', () => ({
  ProblematicComponent: () => <div data-testid="mocked-component">Mocked</div>
}));

// Skip temporaire d'un test
test.skip('test problématique', () => {
  // Test à corriger plus tard
});

// Timeout personnalisé
test('test long', async () => {
  // test
}, { timeout: 10000 });
```

---

## 🎯 Résumé : Commencer Maintenant

1. **Exécuter** : `npm run coverage` pour voir l'état actuel
2. **Modifier** : `vitest.config.ts` avec les nouveaux seuils
3. **Améliorer** : `setupTests.ts` avec plus de mocks
4. **Tester** : Créer 2-3 tests d'intégration cette semaine
5. **Monitorer** : Suivre la progression avec les métriques

**Objectif immédiat** : Passer de ~40% à 70% de couverture en 1 semaine ! 🚀 