import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchMyOrders } from '../services/orders.js';
import { getStatusMeta, summarizeItems } from '../utils/orderStatus.js';
import { useCart } from '../context/CartContext.jsx';

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'Activos' },
  { key: 'completados', label: 'Completados' },
];

const ACTIVE_STATUSES = ['Pendiente', 'Aceptado', 'En proceso'];
const FINISHED_STATUSES = ['Completo', 'Rechazado'];

// Historial real de pedidos (todo lo que ya no está "activo" en el carrito).
export function useOrders(navigation) {
  const { addToCart, refreshCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('todos');
  const [reordering, setReordering] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => setError(err.message || 'No se pudo cargar tu historial de pedidos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = orders.filter((order) => {
    if (tab === 'activos') return ACTIVE_STATUSES.includes(order.status);
    if (tab === 'completados') return FINISHED_STATUSES.includes(order.status);
    return true;
  });

  const goToDetail = (order) => navigation.navigate('OrderDetail', { order });

  const buyAgain = async (order) => {
    setReordering(order._id);
    try {
      for (const item of order.products) {
        if (!item.product?._id) continue;
        await addToCart(item.product._id, item.productType, item.quantity);
      }
      await refreshCart();
      Alert.alert('Listo', 'Agregamos los productos de ese pedido a tu carrito.', [
        { text: 'Ver carrito', onPress: () => navigation.navigate('Cart') },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo repetir el pedido (puede que algún producto ya no tenga stock).');
    } finally {
      setReordering(null);
    }
  };

  return {
    tabs: TABS,
    tab,
    setTab,
    orders: filtered,
    loading,
    error,
    retry: load,
    reordering,
    goToDetail,
    buyAgain,
    getStatusMeta,
    summarizeItems,
  };
}
