import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyOrders } from '../services/orders.js';
import {
  getLocalEvents,
  getPrefs,
  getReadIds,
  notificationsMuted,
} from '../services/notificationsStorage.js';
import { useAuth } from '../context/AuthContext.jsx';

// Los pedidos que van en camino avisan aunque estés en horario no molestar
const IN_TRANSIT = 'En proceso';

// Punto rojo de la campana. Solo mira las dos fuentes baratas y urgentes
// (estado de tus pedidos y eventos que registró la app); el conteo completo,
// con novedades del catálogo, lo arma la pantalla de notificaciones.
// Usa el mismo formato de id que useNotifications para saber qué ya leíste, y
// respeta el nivel de acceso y el horario no molestar que elegiste.
export function useNotificationsBadge() {
  const { isAuthenticated, user } = useAuth();
  const [unread, setUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setUnread(0);
        return;
      }
      Promise.all([
        fetchMyOrders().catch(() => []),
        getLocalEvents(user?.email),
        getReadIds(user?.email),
        getPrefs(user?.email),
      ])
        .then(([orders, events, readIds, prefs]) => {
          if (prefs.access === 'off') {
            setUnread(0);
            return;
          }
          const muted = notificationsMuted(prefs);

          const orderIds = (orders || [])
            .filter((order) => prefs.pedidos)
            // En horario no molestar solo pasan las entregas en tránsito
            .filter((order) => !muted || order.status === IN_TRANSIT)
            .map((order) => 'order-' + order._id + '-' + order.status);

          const eventIds = muted
            ? []
            : (events || [])
                .map((event, index) => ({ event, id: 'event-' + index + '-' + event.date }))
                .filter(({ event }) => prefs[event.kind] !== false)
                .map(({ id }) => id);

          setUnread([...orderIds, ...eventIds].filter((id) => !readIds.has(id)).length);
        })
        .catch(() => setUnread(0));
    }, [isAuthenticated, user?.email])
  );

  return unread;
}
