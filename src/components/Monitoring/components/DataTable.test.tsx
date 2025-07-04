import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { DataTable } from './DataTable';

// Mock des données de logs pour les tests
const mockLogs = [
  {
    id_log: 1,
    _date: '2024-01-15T10:30:00Z',
    is_success: true,
    error_string: '',
    country: {
      id_country: 1,
      name: 'France',
      iso_code: 'FR',
      population: 65000000,
      pib: 42000,
      latitude: 46.2276,
      longitude: 2.2137,
      id_continent: 1,
      id_region: 1,
    },
  },
  {
    id_log: 2,
    _date: '2024-01-15T09:15:00Z',
    is_success: false,
    error_string: 'Connection timeout',
    country: {
      id_country: 2,
      name: 'Germany',
      iso_code: 'DE',
      population: 83000000,
      pib: 46000,
      latitude: 51.1657,
      longitude: 10.4515,
      id_continent: 1,
      id_region: 1,
    },
  },
  {
    id_log: 3,
    _date: '2024-01-15T08:45:00Z',
    is_success: true,
    error_string: null,
    country: {
      id_country: 1,
      name: 'France',
      iso_code: 'FR',
      population: 65000000,
      pib: 42000,
      latitude: 46.2276,
      longitude: 2.2137,
      id_continent: 1,
      id_region: 1,
    },
  },
  {
    id_log: 4,
    _date: '2024-01-15T07:30:00Z',
    is_success: false,
    error_string: 'Database error',
    country: {
      id_country: 3,
      name: 'Italy',
      iso_code: 'IT',
      population: 60000000,
      pib: 35000,
      latitude: 41.8719,
      longitude: 12.5674,
      id_continent: 1,
      id_region: 1,
    },
  },
];

const mockCountries = [
  { id_country: 1, name: 'France' },
  { id_country: 2, name: 'Germany' },
  { id_country: 3, name: 'Italy' },
];

const defaultProps = {
  logs: mockLogs,
  countries: mockCountries,
  loading: false,
  error: null,
};

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu de base', () => {
    it('devrait afficher le tableau avec les données', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('Logs (4)')).toBeInTheDocument();
      expect(screen.getAllByText('France')).toHaveLength(2);
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Italy')).toBeInTheDocument();
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });

    it('devrait afficher les en-têtes de colonnes', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /statut/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pays/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /erreur/i })).toBeInTheDocument();
    });

    it('devrait afficher les badges de statut correctement', () => {
      render(<DataTable {...defaultProps} />);
      
      // Vérifier les badges de succès et d'erreur (sans compter les en-têtes)
      expect(screen.getAllByText('Succès')).toHaveLength(2);
      // Il y a 3 "Erreur" : 1 dans l'en-tête + 2 dans les badges
      expect(screen.getAllByText('Erreur')).toHaveLength(3);
    });

    it('devrait afficher les filtres', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Rechercher dans les logs...')).toBeInTheDocument();
      expect(screen.getByText('Tous les pays')).toBeInTheDocument();
      expect(screen.getByText('Afficher tout')).toBeInTheDocument();
      expect(screen.getByText('Toutes les entrées')).toBeInTheDocument();
    });
  });

  describe('États de chargement et d\'erreur', () => {
    it('devrait afficher l\'état de chargement', () => {
      render(<DataTable {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Chargement des logs...')).toBeInTheDocument();
    });

    it('devrait afficher l\'état d\'erreur', () => {
      render(<DataTable {...defaultProps} error="Erreur de connexion" />);
      
      expect(screen.getByText('Erreur lors du chargement')).toBeInTheDocument();
    });

    it('devrait afficher le message "aucune donnée" quand il n\'y a pas de logs', () => {
      render(<DataTable {...defaultProps} logs={[]} />);
      
      expect(screen.getByText('Aucun log disponible')).toBeInTheDocument();
    });

    it('devrait se rendre correctement avec des pays vides', () => {
      render(<DataTable {...defaultProps} countries={[]} />);
      
      expect(screen.getAllByText('France')).toHaveLength(2);
      expect(screen.getByPlaceholderText('Rechercher dans les logs...')).toBeInTheDocument();
    });
  });

  describe('Filtrage', () => {
    it('devrait filtrer par recherche textuelle', async () => {
      render(<DataTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les logs...');
      fireEvent.change(searchInput, { target: { value: 'Connection' } });
      
      await waitFor(() => {
        expect(screen.getByText('Germany')).toBeInTheDocument();
        expect(screen.queryByText('Italy')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('devrait filtrer par recherche avec des erreurs null', async () => {
      render(<DataTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les logs...');
      fireEvent.change(searchInput, { target: { value: 'France' } });
      
      await waitFor(() => {
        expect(screen.getAllByText('France')).toHaveLength(2);
        expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('devrait afficher tous les logs par défaut', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getAllByText('France')).toHaveLength(2);
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Italy')).toBeInTheDocument();
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });

    it('devrait filtrer quand aucun résultat', async () => {
      render(<DataTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les logs...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCountry' } });
      
      await waitFor(() => {
        expect(screen.getByText('Aucun log disponible')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Tri', () => {
    it('devrait avoir des en-têtes cliquables pour le tri', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /statut/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pays/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /erreur/i })).toBeInTheDocument();
    });

    it('devrait permettre de cliquer sur les en-têtes', () => {
      render(<DataTable {...defaultProps} />);
      
      const dateButton = screen.getByRole('button', { name: /date/i });
      const statusButton = screen.getByRole('button', { name: /statut/i });
      
      // Ces clics ne devraient pas causer d'erreur
      fireEvent.click(dateButton);
      fireEvent.click(statusButton);
      
      expect(dateButton).toBeInTheDocument();
      expect(statusButton).toBeInTheDocument();
    });

    it('devrait afficher les icônes de tri', () => {
      render(<DataTable {...defaultProps} />);
      
      // Il devrait y avoir des icônes de tri dans les en-têtes
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(4); // Au moins les 4 en-têtes
    });
  });

  describe('Pagination', () => {
    it('devrait afficher les informations de pagination de base', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText(/lignes par page/i)).toBeInTheDocument();
      expect(screen.getByText(/page.*sur/i)).toBeInTheDocument();
      expect(screen.getByText(/affichage de.*à.*sur.*entrées/i)).toBeInTheDocument();
    });

    it('devrait afficher les boutons de navigation', () => {
      render(<DataTable {...defaultProps} />);
      
      // Vérifier la présence des boutons de navigation
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(6); // En-têtes + navigation
    });

    it('devrait calculer correctement la pagination avec beaucoup de données', () => {
      // Créer plus de 10 logs pour tester la pagination
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id_log: i + 1,
        _date: `2024-01-15T${String(i % 24).padStart(2, '0')}:00:00Z`,
        is_success: i % 2 === 0,
        error_string: i % 2 === 0 ? '' : `Error ${i}`,
        country: {
          id_country: (i % 3) + 1,
          name: ['France', 'Germany', 'Italy'][i % 3],
          iso_code: ['FR', 'DE', 'IT'][i % 3],
          population: 60000000,
          pib: 40000,
          latitude: 46.0,
          longitude: 2.0,
          id_continent: 1,
          id_region: 1,
        },
      }));

      render(<DataTable {...defaultProps} logs={manyLogs} />);
      
      // Vérifier que les informations de pagination sont cohérentes
      expect(screen.getByText(/25 entrées/i)).toBeInTheDocument();
      expect(screen.getByText(/page 1 sur/i)).toBeInTheDocument();
    });

    it('devrait afficher une seule page pour peu de données', () => {
      render(<DataTable {...defaultProps} />);
      
      // Avec 4 logs, devrait être sur page 1 sur 1
      expect(screen.getByText(/page 1 sur 1/i)).toBeInTheDocument();
    });
  });

  describe('Gestion des erreurs null', () => {
    it('devrait gérer les error_string null dans la recherche', async () => {
      render(<DataTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les logs...');
      fireEvent.change(searchInput, { target: { value: 'inexistant' } });
      
      // Ne devrait pas planter
      await waitFor(() => {
        expect(screen.getByText('Aucun log disponible')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('devrait gérer les clics sur les en-têtes sans planter', () => {
      render(<DataTable {...defaultProps} />);
      
      const errorButton = screen.getByRole('button', { name: /erreur/i });
      
      // Ne devrait pas planter
      fireEvent.click(errorButton);
      expect(errorButton).toBeInTheDocument();
    });

    it('devrait afficher "-" pour les erreurs null/vides', () => {
      render(<DataTable {...defaultProps} />);
      
      // Vérifier qu'il y a des cellules avec "-" pour les erreurs null
      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('devrait afficher les messages d\'erreur quand ils existent', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  describe('Fonctionnalités avancées', () => {
    it('devrait avoir des contrôles de filtrage multiples', () => {
      render(<DataTable {...defaultProps} />);
      
      // Vérifier que tous les contrôles de filtrage sont présents
      expect(screen.getByPlaceholderText('Rechercher dans les logs...')).toBeInTheDocument();
      expect(screen.getByText('Tous les pays')).toBeInTheDocument();
      expect(screen.getByText('Afficher tout')).toBeInTheDocument();
      expect(screen.getByText('Toutes les entrées')).toBeInTheDocument();
    });

    it('devrait afficher le compteur de logs filtrés', () => {
      render(<DataTable {...defaultProps} />);
      
      // Devrait afficher "Logs (4)" dans le titre
      expect(screen.getByText(/logs.*4/i)).toBeInTheDocument();
    });

    it('devrait gérer les interactions sans erreur', () => {
      render(<DataTable {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Rechercher dans les logs...');
      
      // Test de plusieurs interactions
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      fireEvent.change(searchInput, { target: { value: 'France' } });
      
      // Aucune erreur ne devrait être levée
      expect(searchInput).toBeInTheDocument();
    });

    it('devrait maintenir la structure du tableau', () => {
      render(<DataTable {...defaultProps} />);
      
      // Vérifier la structure de base du tableau
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(5); // 1 en-tête + 4 données
    });
  });
}); 