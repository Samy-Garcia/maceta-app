import { useCallback, useMemo, useRef, useState } from 'react';
import { fetchMyOrders } from '../services/orders.js';
import { useOrderActions } from './useOrderActions.jsx';
import { getStatusMeta } from '../utils/orderStatus.js';
import { useFocusEffect } from '@react-navigation/native';

// Las pestañas agrupan los estados reales del backend (ver STATUS_META):
// Pendiente/Aceptado siguen en el taller, "En proceso" ya va en camino y
// "Completo" es la entrega hecha.
const TABS = [
  { key: 'todos', label: 'Todos', statuses: null },
  { key: 'pendientes', label: 'Pendientes', statuses: ['Pendiente', 'Aceptado'] },
  { key: 'camino', label: 'En camino', statuses: ['En proceso'] },
  { key: 'entregados', label: 'Entregados', statuses: ['Completo'] },
  { key: 'rechazados', label: 'Rechazados', statuses: ['Rechazado'] },
];

const ACTIVE_TAB_KEYS = ['pendientes', 'camino'];

// Historial real de pedidos (todo lo que ya no está "activo" en el carrito).
export function useOrders(navigation) {
  const actions = useOrderActions(navigation);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('todos');
  const [query, setQuery] = useState('');

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    return fetchMyOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => setError(err.message || 'No se pudo cargar tu historial de pedidos.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  // La primera vez muestra el estado de carga; al volver de pagar o de dejar
  // una reseña solo refresca en silencio.
  const hasLoaded = useRef(false);
  useFocusEffect(
    useCallback(() => {
      load(hasLoaded.current);
      hasLoaded.current = true;
    }, [load])
  );

  const countOf = useCallback(
    (key) => {
      const config = TABS.find((t) => t.key === key);
      if (!config?.statuses) return orders.length;
      return orders.filter((order) => config.statuses.includes(order.status)).length;
    },
    [orders]
  );

  // "Rechazados" solo aparece si el cliente tiene alguno
  const tabs = useMemo(
    () => TABS.filter((t) => t.key !== 'rechazados' || countOf('rechazados') > 0),
    [countOf]
  );

  const activeCount = ACTIVE_TAB_KEYS.reduce((sum, key) => sum + countOf(key), 0);

  const filtered = useMemo(() => {
    const config = TABS.find((t) => t.key === tab);
    let list = config?.statuses
      ? orders.filter((order) => config.statuses.includes(order.status))
      : orders;

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (order) =>
          order.orderCode?.toLowerCase().includes(q) ||
          (order.products || []).some((item) => item.product?.name?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, tab, query]);

  const goToDetail = (order) => navigation.navigate('OrderDetail', { order });

  return {
    tabs,
    tab,
    setTab,
    countOf,
    activeCount,
    query,
    setQuery,
    orders: filtered,
    totalOrders: orders.length,
    loading,
    refreshing,
    error,
    retry: () => load(),
    refresh: () => load(true),
    goToDetail,
    ...actions,
    getStatusMeta,
  };
}
