# Guide du Contrôle Vocal

## Présentation

Le système de contrôle vocal permet aux utilisateurs de naviguer et contrôler l'application AnalyzeIt entièrement par la voix. Cette fonctionnalité améliore l'accessibilité et l'expérience utilisateur, particulièrement utile pour les personnes ayant des difficultés motrices ou travaillant dans des environnements où l'utilisation des mains est limitée.

## Prérequis

### Navigateurs supportés
- **Chrome** (recommandé) : Support complet
- **Microsoft Edge** : Support complet  
- **Safari** : Support partiel
- **Firefox** : Non supporté actuellement

### Permissions requises
- **Microphone** : L'application demande l'autorisation d'accéder au microphone
- **HTTPS** : Le contrôle vocal nécessite une connexion sécurisée (HTTPS)

## Interface utilisateur

### Bouton flottant
Un bouton flottant est disponible en permanence en bas à droite de l'écran :
- **Vert** : Prêt à écouter
- **Rouge clignotant** : Écoute en cours
- **Gris** : Non disponible

### Panneau de contrôle (page Prédictions)
Sur la page des prédictions, un panneau dédié offre :
- Bouton de microphone principal
- Affichage du transcript en temps réel
- Indicateur de confiance
- Historique des commandes
- Aide contextuelle

## Commandes disponibles

### Navigation
| Commande | Synonymes | Action |
|----------|-----------|---------|
| "Accueil" | "Page d'accueil", "Aller à l'accueil" | Navigue vers la page d'accueil |
| "Prédictions" | "Aller aux prédictions", "Page prédictions" | Navigue vers la page des prédictions |

### Contrôle des prédictions

#### Dates
| Commande | Exemple | Description |
|----------|---------|-------------|
| "Date de début [date]" | "Date de début demain" | Définit la date de début |
| "Date de fin [date]" | "Date de fin dans 30 jours" | Définit la date de fin |

**Formats de date supportés :**
- Relatif : "demain", "aujourd'hui", "dans X jours"
- Absolu : "15/12/2024", "15 décembre 2024"

#### Pays
| Commande | Exemple | Description |
|----------|---------|-------------|
| "Pays [nom]" | "Pays France" | Sélectionne un pays |
| "Sélectionner [nom]" | "Sélectionner Allemagne" | Sélectionne un pays |

#### Exécution
| Commande | Synonymes | Action |
|----------|-----------|---------|
| "Afficher les prédictions" | "Lancer les prédictions", "Calculer" | Lance l'analyse |

## Utilisation

### Activation
1. Cliquez sur le bouton de microphone (flottant ou dans le panneau)
2. Attendez le signal visuel (animation rouge)
3. Parlez clairement votre commande
4. L'écoute s'arrête automatiquement après 30 secondes

### Conseils d'utilisation
- **Parlez clairement** et à un rythme normal
- **Attendez** le signal visuel avant de parler
- **Utilisez** les mots-clés exacts pour une meilleure reconnaissance
- **Évitez** les bruits de fond importants

### Exemple d'utilisation complète
```
1. "Prédictions" → Navigate vers la page des prédictions
2. "Date de début demain" → Définit la date de début
3. "Date de fin dans 60 jours" → Définit la date de fin  
4. "Pays France" → Sélectionne la France
5. "Afficher les prédictions" → Lance l'analyse
```

## Architecture technique

### Components principaux

#### `useVoiceControl` (Hook)
- Gère la reconnaissance vocale
- Traite les commandes
- Gère les états d'écoute
- Interface avec l'API Web Speech

#### `VoiceControl` (Component)
- Interface utilisateur complète
- Panneau d'aide
- Affichage des états
- Intégration avec les prédictions

#### `VoiceControlButton` (Component)
- Bouton flottant global
- Notification d'état
- Disponible sur toutes les pages

### Intégration
```tsx
// Dans une page/composant
import VoiceControl from '@/components/VoiceControl';

const MyComponent = () => {
  const handleDateSelect = (type: 'start' | 'end', date: string) => {
    // Logique de sélection de date
  };

  const handleCountrySelect = (countryName: string) => {
    // Logique de sélection de pays
  };

  return (
    <VoiceControl
      onDateSelect={handleDateSelect}
      onCountrySelect={handleCountrySelect}
      onFetchPredictions={fetchPredictions}
      countries={countries}
    />
  );
};
```

## Accessibilité

### Fonctionnalités d'accessibilité
- **Support des lecteurs d'écran** : ARIA labels appropriés
- **Navigation au clavier** : Tous les contrôles sont accessibles
- **Contrastes élevés** : Couleurs conformes aux standards WCAG
- **Feedback visuel** : Indicateurs clairs d'état

### Alternatives non-vocales
- Tous les contrôles vocaux ont des équivalents visuels
- Navigation traditionnelle toujours disponible
- Raccourcis clavier pour les fonctions principales

## Dépannage

### Problèmes courants

#### "Contrôle vocal non supporté"
- Vérifiez votre navigateur (Chrome recommandé)
- Assurez-vous d'utiliser HTTPS
- Mettez à jour votre navigateur

#### "Erreur de microphone"
- Vérifiez les permissions du microphone
- Assurez-vous qu'aucune autre application n'utilise le microphone
- Redémarrez le navigateur

#### "Commandes non reconnues"
- Parlez plus clairement
- Utilisez les mots-clés exacts
- Réduisez le bruit ambiant
- Vérifiez la langue du navigateur (français)

#### "Faible précision"
- Améliorez la qualité du microphone
- Rapprochez-vous du microphone
- Éliminez les bruits de fond
- Parlez à un rythme normal

### Diagnostic
L'interface affiche :
- **Transcript** : Ce qui a été entendu
- **Confiance** : Niveau de certitude (0-100%)
- **Dernière commande** : Résultat de l'interprétation
- **Erreurs** : Messages d'erreur détaillés

## Évolutions futures

### Améliorations prévues
- Support de Firefox
- Commandes supplémentaires
- Reconnaissance multilingue
- Personnalisation des commandes
- Intégration avec l'intelligence artificielle

### Contributions
Le système est extensible :
- Nouvelles commandes dans `useVoiceControl`
- Nouveaux patterns de reconnaissance
- Améliorations de l'interface
- Optimisations de performance

---

*Cette documentation est maintenue avec la version 1.0 du système de contrôle vocal.* 