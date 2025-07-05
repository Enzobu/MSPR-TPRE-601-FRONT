import { describe, it, expect, vi, beforeEach } from 'vitest';

import useLogs from '../../hooks/useLogs';
import { render, screen, fireEvent, waitFor } from '../../test-utils';

import Monitoring from './Monitoring';

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
];

const mockCountries = [
  {
    id_country: 1,
    name: 'France',
    iso_code: 'FR',
    population: '65000000',
    pib: '42000',
    latitude: '46.2276',
    longitude: '2.2137',
    id_continent: 1,
    id_region: 1,
  },
  {
    id_country: 2,
    name: 'Germany',
    iso_code: 'DE',
    population: '83000000',
    pib: '46000',
    latitude: '51.1657',
    longitude: '10.4515',
    id_continent: 1,
    id_region: 1,
  },
];

const mockRefetchLogs = vi.fn();

// Mock du hook useLogs
vi.mock('../../hooks/useLogs', () => ({
  default: vi.fn(() => ({
    logs: mockLogs,
    loading: false,
    error: null,
    refetchLogs: mockRefetchLogs,
  })),
}));

// Mock du hook useCountries
vi.mock('../Predictions/hooks/useCountries', () => ({
  useCountries: vi.fn(() => ({
    countries: mockCountries,
    loading: false,
    error: null,
  })),
}));

describe('Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le titre et la description', () => {
    render(<Monitoring />);
    
    expect(screen.getByText('Monitoring des Logs')).toBeInTheDocument();
    expect(screen.getByText('Surveillance des logs d\'application en temps réel')).toBeInTheDocument();
  });

  it('devrait afficher les statistiques correctes', () => {
    render(<Monitoring />);
    
    // Total des logs
    expect(screen.getByText('Total des logs')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Logs réussis
    expect(screen.getByText('Logs réussis')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Logs d'erreurs
    expect(screen.getByText('Logs d\'erreurs')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Taux de succès
    expect(screen.getByText('Taux de succès')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('devrait afficher le bouton de rafraîchissement', () => {
    render(<Monitoring />);
    
    const refreshButton = screen.getByRole('button', { name: /actualiser/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('devrait appeler refetchLogs quand on clique sur le bouton rafraîchir', async () => {
    render(<Monitoring />);
    
    const refreshButton = screen.getByRole('button', { name: /actualiser/i });
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockRefetchLogs).toHaveBeenCalledTimes(1);
    });
  });

  it('devrait afficher les logs dans le tableau', () => {
    render(<Monitoring />);
    
    // Vérifier que les logs sont affichés (France apparaît 2 fois)
    expect(screen.getAllByText('France')).toHaveLength(2);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('devrait afficher les filtres', () => {
    render(<Monitoring />);
    
    // Vérifier la présence des contrôles de filtrage
    expect(screen.getByPlaceholderText('Rechercher dans les logs...')).toBeInTheDocument();
    expect(screen.getByText('Tous les pays')).toBeInTheDocument();
    expect(screen.getByText('Afficher tout')).toBeInTheDocument();
    expect(screen.getByText('Toutes les entrées')).toBeInTheDocument();
  });

  it('devrait calculer les statistiques correctement avec des logs vides', () => {
    const mockUseLogs = vi.mocked(useLogs);
    mockUseLogs.mockReturnValue({
      logs: [],
      loading: false,
      error: null,
      refetchLogs: mockRefetchLogs,
    });

    render(<Monitoring />);
    
    // Vérifier que tous les "0" sont affichés (total, succès, erreurs)
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('0%')).toBeInTheDocument(); // Taux de succès
  });

  it('devrait afficher un état de chargement', () => {
    const mockUseLogs = vi.mocked(useLogs);
    mockUseLogs.mockReturnValue({
      logs: [],
      loading: true,
      error: null,
      refetchLogs: mockRefetchLogs,
    });

    render(<Monitoring />);
    
    expect(screen.getByText('Chargement des logs...')).toBeInTheDocument();
  });

  it('devrait afficher une erreur', () => {
    const mockUseLogs = vi.mocked(useLogs);
    mockUseLogs.mockReturnValue({
      logs: [],
      loading: false,
      error: 'Erreur de connexion',
      refetchLogs: mockRefetchLogs,
    });

    render(<Monitoring />);
    
    expect(screen.getByText('Erreur lors du chargement')).toBeInTheDocument();
  });
}); 