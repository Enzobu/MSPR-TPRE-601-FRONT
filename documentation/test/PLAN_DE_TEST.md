# Plan de Test - Projet WHO Front-End

## 📋 Vue d'ensemble

Ce document décrit la stratégie de test complète pour l'application front-end WHO d'analyse de données épidémiologiques.

## 🏗️ Architecture des Tests

### Outils Utilisés
- **Vitest** - Runner de tests rapide et moderne
- **React Testing Library** - Tests de composants centrés utilisateur
- **jsdom** - Environnement DOM pour les tests
- **@testing-library/user-event** - Simulation d'interactions utilisateur
- **@testing-library/jest-dom** - Assertions DOM étendues

### Structure des Tests
```
src/
├── components/
│   ├── Component/
│   │   ├── Component.tsx
│   │   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
├── utils/
│   ├── utility.ts
│   └── utility.test.ts
└── types/
    ├── types.ts
    └── types.test.ts
```

## 🎯 Objectifs de Qualité

### Couverture de Code
- **Objectif** : 80% de couverture globale
- **Seuils minimum** :
  - Lignes : 75%
  - Fonctions : 80%
  - Branches : 70%
  - Statements : 75%

### Métriques de Performance
- Temps d'exécution < 30s pour tous les tests
- Pas de fuites mémoire
- Tests parallelisés

## 🔍 Types de Tests

### 1. Tests Unitaires (Niveau 1)

#### **Composants UI**
```typescript
// Exemple de test de composant
describe('UserLogin', () => {
  it('devrait afficher les champs requis', () => {
    render(<UserLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });
});
```

**Composants à tester prioritairement :**
- [ ] AuthGuard (sécurité)
- [ ] Navbar (navigation)
- [ ] UserLogin/UserRegister (authentification)
- [ ] Predictions (logique métier)
- [ ] MortalityRateChart (visualisation)
- [ ] DataTable (affichage de données)

#### **Hooks Personnalisés**
```typescript
// Exemple de test de hook
describe('useAuth', () => {
  it('devrait gérer l\'authentification', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

**Hooks à tester :**
- [ ] useAuth (authentification)
- [ ] useCountries (données géographiques)
- [ ] usePredictions (prédictions)
- [ ] useMortalityRate (taux de mortalité)
- [ ] useLoggedUser (utilisateur connecté)

#### **Utilitaires**
- [ ] flagUtils (gestion des drapeaux)
- [ ] chartOptions (configuration graphiques)
- [ ] capitalize (formatage texte)
- [ ] countryTranslations (traductions)

### 2. Tests d'Intégration (Niveau 2)

#### **Flux d'Authentification**
```typescript
describe('Flux d\'authentification', () => {
  it('devrait connecter un utilisateur valide', async () => {
    // Test du flux complet de connexion
    render(<App />);
    
    // Navigation vers login
    fireEvent.click(screen.getByText('Se connecter'));
    
    // Saisie des données
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@who.int' }
    });
    
    // Soumission et vérification
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    });
  });
});
```

**Scénarios d'intégration :**
- [ ] Connexion/Déconnexion utilisateur
- [ ] Navigation protégée (AuthGuard)
- [ ] Gestion des erreurs API
- [ ] Changement de thème (clair/sombre)
- [ ] Changement de langue
- [ ] Flux de gestion utilisateurs (admin)

#### **Intégrations API**
```typescript
describe('API Integration', () => {
  beforeEach(() => {
    // Mock des appels API
    global.fetch = vi.fn();
  });

  it('devrait récupérer les prédictions', async () => {
    const mockPredictions = [/* données mock */];
    
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPredictions
    });

    // Test de l'intégration
  });
});
```

### 3. Tests End-to-End (Niveau 3)

#### **Installation de Playwright**
```bash
npm install -D @playwright/test
npx playwright install
```

#### **Configuration Playwright**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

#### **Scénarios E2E**
```typescript
// e2e/auth.spec.ts
test('Parcours utilisateur complet', async ({ page }) => {
  await page.goto('/');
  
  // Connexion
  await page.click('text=Se connecter');
  await page.fill('[data-testid="email"]', 'admin@who.int');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Vérification du tableau de bord
  await expect(page.locator('h1')).toContainText('Tableau de bord');
  
  // Navigation vers prédictions
  await page.click('text=Prédictions');
  
  // Sélection des paramètres
  await page.selectOption('select[name="country"]', 'France');
  await page.fill('input[name="startDate"]', '2024-01-01');
  await page.fill('input[name="endDate"]', '2024-01-31');
  
  // Génération des prédictions
  await page.click('text=Afficher les prédictions');
  
  // Vérification des résultats
  await expect(page.locator('canvas')).toBeVisible();
});
```

### 4. Tests de Performance

#### **Métriques à surveiller**
- **Temps de chargement initial** < 3s
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Time to Interactive** < 4s
- **Cumulative Layout Shift** < 0.1

#### **Outils recommandés**
- **Lighthouse CI** pour l'audit automatique
- **WebPageTest** pour les tests de performance
- **Bundle Analyzer** pour l'optimisation du code

### 5. Tests d'Accessibilité

#### **Critères WCAG 2.1**
- [ ] Contraste de couleurs (AA)
- [ ] Navigation au clavier
- [ ] Lecteurs d'écran
- [ ] Textes alternatifs
- [ ] Structure sémantique

#### **Outils d'accessibilité**
```typescript
// Test d'accessibilité avec axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('devrait être accessible', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📊 Stratégie de Test par Composant

### **Composants Critiques** (Tests prioritaires)

| Composant | Tests Unitaires | Tests Intégration | Tests E2E |
|-----------|----------------|------------------|-----------|
| AuthGuard | ✅ | ✅ | ✅ |
| UserLogin | ✅ | ✅ | ✅ |
| Predictions | ✅ | ✅ | ✅ |
| DataTable | ✅ | ✅ | ⚠️ |
| Charts | ✅ | ⚠️ | ⚠️ |

### **Composants Secondaires**

| Composant | Tests Unitaires | Tests Intégration | Tests E2E |
|-----------|----------------|------------------|-----------|
| ThemeToggle | ✅ | ⚠️ | ❌ |
| Navbar | ✅ | ✅ | ❌ |
| UserProfile | ✅ | ⚠️ | ❌ |
| Settings | ✅ | ⚠️ | ❌ |

## 🚀 Mise en Œuvre

### **Phase 1 : Consolidation des Tests Unitaires**
```bash
# Exécuter les tests existants
npm run test

# Vérifier la couverture
npm run coverage

# Améliorer la couverture jusqu'à 80%
```

### **Phase 2 : Tests d'Intégration**
```bash
# Créer les tests d'intégration
mkdir src/__tests__/integration

# Tester les flux principaux
```

### **Phase 3 : Tests E2E**
```bash
# Installer Playwright
npm install -D @playwright/test

# Configurer les tests E2E
mkdir e2e
```

### **Phase 4 : Automatisation CI/CD**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📈 Métriques et Reporting

### **Rapports de Test**
- **Coverage Report** : `./coverage/index.html`
- **Test Results** : Format JUnit XML
- **E2E Reports** : Playwright HTML Reporter

### **Seuils de Qualité**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 75,
          statements: 75
        }
      }
    }
  }
});
```

## 🔧 Commandes Utiles

```bash
# Tests unitaires
npm run test                 # Exécuter tous les tests
npm run test:ui             # Interface graphique
npm run test:watch          # Mode watch
npm run coverage            # Rapport de couverture

# Tests E2E (à ajouter)
npm run test:e2e            # Tests end-to-end
npm run test:e2e:headed     # Avec interface graphique

# Qualité globale
npm run quality             # Lint + Tests
```

## 📚 Ressources et Documentation

### **Guides de Test**
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

### **Bonnes Pratiques**
- Tester le comportement, pas l'implémentation
- Utiliser des data-testid pour les éléments complexes
- Mocker les appels API externes
- Prioriser les tests des chemins critiques
- Maintenir des tests rapides et fiables

## 🎯 Objectifs à Court Terme

1. **Semaine 1-2** : Améliorer la couverture unitaire à 80%
2. **Semaine 3-4** : Implémenter les tests d'intégration
3. **Semaine 5-6** : Configurer les tests E2E
4. **Semaine 7-8** : Intégrer dans le pipeline CI/CD
5. **Semaine 9-10** : Documentation et formation équipe

---

*Ce plan de test est un document vivant qui doit être mis à jour régulièrement selon l'évolution du projet.* 