import { useState, useEffect } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

import type { Log } from "../types/types";

interface UseLogsProps {
  countryId?: number;
}

const useLogs = ({ countryId }: UseLogsProps = {}) => {
  const authHeader = useAuthHeader();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (id_country?: number) => {
    if (!authHeader) {
      setError("Token d'authentification manquant.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = id_country 
        ? `http://qg.enzo-palermo.com:5001/swagger/logs/get?id_country=${id_country}`
        : `http://qg.enzo-palermo.com:5001/swagger/logs/get`;

      const response = await fetch(url, {
        headers: {
          Authorization: authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des logs.");
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError("Erreur lors de la récupération des logs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(countryId);
  }, [authHeader, countryId]);

  return { logs, loading, error, refetchLogs: fetchLogs };
};

export default useLogs; 