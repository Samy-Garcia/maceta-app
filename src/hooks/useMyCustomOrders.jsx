import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyCustomOrders } from '../services/customOrders.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Historial de solicitudes de personalización. Cuando el taller acepta una
// con precio, se puede agregar al carrito (igual que un producto normal).
export function useMyCustomOrders(navigation) {
  const { addCustomOrderToCart } = useCart();
  const toast = useToast();

  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [addingId, setAddingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchMyCustomOrders()
      .then((list) => setCustomOrders(list || []))
      .catch((err) => setError(err.message || 'No se pudieron cargar tus personalizaciones.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const getQuantity = (id) => quantities[id] ?? 1;
  const setQuantity = (id, value) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, value) }));

  const addToCart = async (customOrder) => {
    setAddingId(customOrder._id);
    try {
      await addCustomOrderToCart(customOrder._id, getQuantity(customOrder._id));
      toast.success('¡Agregado al carrito!', customOrder.productName);
      setCustomOrders((prev) =>
        prev.map((item) => (item._id === customOrder._id ? { ...item, status: 'En proceso' } : item))
      );
      navigation.navigate('Cart');
    } catch (err) {
      toast.error('No se pudo agregar', err.message || 'No se pudo agregar al carrito.');
    } finally {
      setAddingId(null);
    }
  };

  return { customOrders, loading, error, retry: load, getQuantity, setQuantity, addingId, addToCart };
}
