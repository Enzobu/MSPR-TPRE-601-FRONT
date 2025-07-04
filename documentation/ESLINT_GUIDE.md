# Guide ESLint - Qualité du Code React

## 📋 Vue d'ensemble

Ce projet utilise ESLint pour maintenir la qualité du code React/TypeScript avec des règles strictes pour :
- **React** : Bonnes pratiques JSX, hooks, composants
- **TypeScript** : Typage strict, imports, variables non utilisées
- **Accessibilité** : Règles jsx-a11y pour l'accessibilité web
- **Imports** : Organisation et ordre des imports
- **Qualité générale** : Syntaxe ES6+, éviter les erreurs communes

## 🚀 Commandes disponibles

### Vérification du code
```bash
# Vérifier tous les fichiers
npm run lint

# Vérifier avec zéro tolérance aux warnings
npm run lint:check

# Vérifier la qualité complète (lint + tests)
npm run quality
```

### Correction automatique
```bash
# Corriger automatiquement les erreurs fixables
npm run lint:fix

# Alias pour le formatage
npm run format
```

## 📋 Principales règles configurées

### React
- ✅ **Hooks** : Règles exhaustives pour les dépendances
- ✅ **JSX** : Clés, props, syntaxe
- ✅ **Composants** : Exports, refresh, nommage
- ❌ **prop-types** : Désactivé (on utilise TypeScript)

### TypeScript
- ✅ **Variables non utilisées** : Erreur (préfixe `_` autorisé)
- ⚠️ **any** : Warning (à éviter)
- ✅ **Fonctions vides** : Warning dans les tests, erreur ailleurs
- ✅ **Assertions non-null** : Warning

### Accessibilité (jsx-a11y)
- ✅ **alt-text** : Texte alternatif obligatoire
- ✅ **aria-*** : Propriétés ARIA correctes
- ✅ **Éléments interactifs** : Événements clavier
- ✅ **Rôles** : Rôles ARIA valides

### Imports
- ✅ **Ordre** : builtin → external → internal → parent → sibling
- ✅ **Groupement** : Lignes vides entre groupes
- ✅ **Alphabétique** : Tri automatique
- ✅ **Doublons** : Détection des imports dupliqués

### Qualité générale
- ⚠️ **console.log** : Warning (à éviter en production)
- ✅ **const/let** : Pas de `var`
- ✅ **Template literals** : Préférer \`${}\` à la concaténation
- ✅ **Égalité stricte** : `===` au lieu de `==`

## 🔧 Configuration par type de fichier

### Fichiers de test (`*.test.tsx`, `*.spec.tsx`)
```typescript
// Configuration spéciale pour les tests
{
  'no-console': 'off',              // console.log autorisé
  '@typescript-eslint/no-explicit-any': 'off'  // any autorisé
}
```

### Fichiers ignorés
- Configuration : `*.config.js`, `*.config.ts`
- Types : `*.d.ts`
- Build : `dist/`, `node_modules/`, `coverage/`

## 📊 Métriques de qualité

### Avant ESLint
- **379 problèmes** détectés
- Code non standardisé
- Imports désorganisés

### Après configuration
- **287 erreurs** corrigées automatiquement
- **99 problèmes** restants (principalement warnings)
- Code standardisé et maintenable

## 💡 Bonnes pratiques

### 1. Correction automatique
```bash
# Lancez toujours avant de commiter
npm run lint:fix
```

### 2. Hooks React
```typescript
// ❌ Éviter
useEffect(() => {
  fetchData();
}, []); // Dépendance manquante

// ✅ Correct
useEffect(() => {
  fetchData();
}, [fetchData]); // Ou incluez fetchData dans le tableau
```

### 3. Imports
```typescript
// ✅ Ordre correct (automatiquement corrigé)
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserService } from '../services/user';
```

### 4. Accessibilité
```typescript
// ❌ Éviter
<img src="logo.png" />

// ✅ Correct
<img src="logo.png" alt="Logo de l'application" />
```

### 5. TypeScript
```typescript
// ❌ Éviter
const handleSubmit = (data: any) => {
  console.log(data);
};

// ✅ Correct
const handleSubmit = (data: FormData) => {
  // console.log en développement seulement
};
```

## 🔄 Intégration CI/CD

### Pre-commit hook (recommandé)
```bash
# Installer husky
npm install --save-dev husky

# Configurer le hook
npx husky add .husky/pre-commit "npm run quality"
```

### Pipeline CI
```yaml
# .github/workflows/quality.yml
- name: Check code quality
  run: npm run quality
```

## 📝 Résolution des problèmes courants

### Import/order
```bash
# Correction automatique
npm run lint:fix
```

### React hooks dependencies
```typescript
// Ajouter les dépendances manquantes ou utiliser useCallback
const fetchData = useCallback(async () => {
  // logique
}, [dependency]);
```

### Unescaped entities
```typescript
// Remplacer les caractères spéciaux
const text = "Message avec &quot;guillemets&quot;";
```

### Console statements
```typescript
// Remplacer par un logger en production
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

## 🎯 Objectifs qualité

- **0 erreurs** ESLint en production
- **< 10 warnings** par fichier
- **Coverage** tests > 80%
- **Accessibilité** : Tous les composants conformes

---

💡 **Tip** : Configurez votre IDE pour afficher les erreurs ESLint en temps réel et corriger automatiquement à la sauvegarde. 