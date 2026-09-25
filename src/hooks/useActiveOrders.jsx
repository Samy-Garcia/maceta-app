import { useEffect, useState } from 'react';
import { fetchMyOrders } from '../services/orders.js';
import { ACTIVE_STATUSES } from '../utils/orderStatus.js';
import { useAuth } from '../context/AuthContext.jsx';

// Cuántos pedidos del cliente siguen en curso. Es lo que enciende el punto
// rojo de la campana; si no hay sesión o falla, simplemente no se muestra.
export function useActiveOrders() {
  const { isAuthenticated } = useAuth();
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveOrders(0);
      return;
    }
    fetchMyOrders()
      .then((orders) =>
        setActiveOrders((orders || []).filter((order) => ACTIVE_STATUSES.includes(order.status)).length)
      )
      .catch(() => setActiveOrders(0));
  }, [isAuthenticated]);

  return activeOrders;
}
