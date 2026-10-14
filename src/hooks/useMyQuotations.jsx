import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyQuotations } from '../services/quotations.js';

// Historial de solicitudes de cotización del cliente (GET /api/quotations/mine).
export function useMyQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchMyQuotations()
      .then((list) => setQuotations(list || []))
      .catch((err) => setError(err.message || 'No se pudieron cargar tus cotizaciones.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { quotations, loading, error, retry: load };
}
