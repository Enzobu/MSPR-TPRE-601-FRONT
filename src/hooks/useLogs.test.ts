import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useLogs from './useLogs';

// Mock de fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock de useAuthHeader - déclarer avant vi.mock
const mockUseAuthHeader = vi.fn();

// Mock module
vi.mock('react-auth-kit/hooks/useAuthHeader', () => ({
  default: () => mockUseAuthHeader(),
}));

const mockLogsResponse = [
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
];

describe('useLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthHeader.mockReturnValue('Bearer test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devrait récupérer tous les logs avec succès', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLogsResponse,
    });

    const { result } = renderHook(() => useLogs());

    expect(result.current.loading).toBe(true);
    expect(result.current.logs).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual(mockLogsResponse);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://qg.enzo-palermo.com:5001/swagger/logs/get',
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('devrait récupérer les logs filtrés par pays', async () => {
    const countryId = 1;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockLogsResponse[0]], // Seulement les logs de France
    });

    const { result } = renderHook(() => useLogs({ countryId }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual([mockLogsResponse[0]]);
    expect(mockFetch).toHaveBeenCalledWith(
      `http://qg.enzo-palermo.com:5001/swagger/logs/get?id_country=${countryId}`,
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('devrait gérer les erreurs de réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLogs());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erreur lors de la récupération des logs.');
    expect(result.current.logs).toEqual([]);
  });

  it('devrait gérer les erreurs HTTP', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erreur lors de la récupération des logs.');
    expect(result.current.logs).toEqual([]);
  });

  it('devrait gérer l\'absence de token d\'authentification', async () => {
    mockUseAuthHeader.mockReturnValue(null);

    const { result } = renderHook(() => useLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Token d\'authentification manquant.');
    expect(result.current.logs).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('devrait permettre de rafraîchir les logs manuellement', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLogsResponse,
    });

    const { result } = renderHook(() => useLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual(mockLogsResponse);

    // Simuler de nouvelles données
    const newLogsResponse = [...mockLogsResponse, {
      id_log: 3,
      _date: '2024-01-15T11:00:00Z',
      is_success: true,
      error_string: '',
      country: mockLogsResponse[0].country,
    }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newLogsResponse,
    });

    // Rafraîchir les logs
    await act(async () => {
      result.current.refetchLogs();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual(newLogsResponse);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('devrait rafraîchir avec un filtre de pays', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLogsResponse,
    });

    const { result } = renderHook(() => useLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const countryId = 2;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockLogsResponse[1]], // Seulement les logs d'Allemagne
    });

    // Rafraîchir avec un filtre de pays
    await act(async () => {
      result.current.refetchLogs(countryId);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual([mockLogsResponse[1]]);
    expect(mockFetch).toHaveBeenLastCalledWith(
      `http://qg.enzo-palermo.com:5001/swagger/logs/get?id_country=${countryId}`,
      {
        headers: {
          Authorization: 'Bearer test-token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('devrait recréer la requête quand le token d\'auth change', async () => {
    // Premier rendu avec un token
    mockUseAuthHeader.mockReturnValue('Bearer token1');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLogsResponse,
    });

    const { rerender } = renderHook(() => useLogs());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Changer le token
    mockUseAuthHeader.mockReturnValue('Bearer token2');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLogsResponse,
    });

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://qg.enzo-palermo.com:5001/swagger/logs/get',
      {
        headers: {
          Authorization: 'Bearer token2',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  });
}); 