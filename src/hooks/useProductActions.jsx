import { useState } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '../services/api.js';
import { fetchFavoriteIds } from '../services/products.js';
import { useCart } from '../context/CartContext.jsx';

// Favoritos (wishlist) y agregar al carrito: lo comparten cualquier pantalla
// que muestre tarjetas de producto (Productos, Home, etc).
export function useProductActions() {
  const { addToCart: addToCartApi } = useCart();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const loadFavorites = () => {
    fetchFavoriteIds()
      .then((ids) => setFavoriteIds(new Set(ids || [])))
      .catch(() => {});
  };

  const toggleFavorite = async (product) => {
    if (product.productType === 'planta') {
      Alert.alert('No disponible', 'Los favoritos todavía no están disponibles para plantas.');
      return;
    }
    const wasFavorite = favoriteIds.has(product.id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorite ? next.delete(product.id) : next.add(product.id);
      return next;
    });
    try {
      const res = await apiFetch('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, productType: product.productType }),
      });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        res.inWishlist ? next.add(product.id) : next.delete(product.id);
        return next;
      });
    } catch (err) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorite ? next.add(product.id) : next.delete(product.id);
        return next;
      });
      Alert.alert('Error', err.message || 'No se pudo actualizar tu lista de deseos.');
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!product.stock) {
      Alert.alert('Sin stock', 'Este producto no tiene unidades disponibles por ahora.');
      return;
    }
    try {
      await addToCartApi(product.id, product.productType, quantity);
      Alert.alert('Agregado', `${product.name} se agregó al carrito.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar el producto al carrito.');
    }
  };

  return { favoriteIds, loadFavorites, toggleFavorite, addToCart };
}
