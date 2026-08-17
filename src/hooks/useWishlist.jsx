import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { fetchMyWishlists, fetchWishlistById, removeFromWishlist } from '../services/wishlist.js';
import { useCart } from '../context/CartContext.jsx';

// Lista de deseos real del cliente (la lista principal/default que llena el
// corazón rápido en Productos, Home y el detalle de producto).
export function useWishlist() {
  const { addToCart } = useCart();
  const [listId, setListId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyWishlists()
      .then((lists) => {
        const defaultList = lists?.find((l) => l.isDefault) || lists?.[0];
        if (!defaultList) {
          setItems([]);
          return null;
        }
        setListId(defaultList._id);
        return fetchWishlistById(defaultList._id);
      })
      .then((full) => setItems(full?.items || []))
      .catch((err) => setError(err.message || 'No se pudo cargar tu lista de deseos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = query.trim()
    ? items.filter((item) => item.product?.name?.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  const handleRemove = async (item) => {
    if (!listId) return;
    setRemovingId(item._id);
    try {
      await removeFromWishlist(listId, item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo quitar el producto de tu lista.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item) => {
    if (!item.product?.stock) {
      Alert.alert('Sin stock', 'Este producto no tiene unidades disponibles por ahora.');
      return;
    }
    try {
      await addToCart(item.productId, item.productType, 1);
      Alert.alert('Agregado', `${item.product.name} se agregó al carrito.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar el producto al carrito.');
    }
  };

  return { items: filtered, totalCount: items.length, loading, error, retry: load, query, setQuery, removingId, handleRemove, handleAddToCart };
}
