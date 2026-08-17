import { useState } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '../services/api.js';
import { fetchFavoriteIds } from '../services/products.js';
import { useCart } from '../context/CartContext.jsx';

// El backend identifica cada favorito como "tipo-id" (ver getFavoriteIds en
// wishListController.js), no solo el id del producto — dos productos de
// distinto tipo podrían compartir el mismo _id de Mongo por coincidencia.
export const favoriteKey = (productType, id) => `${productType}-${id}`;

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
    const key = favoriteKey(product.productType, product.id);
    const wasFavorite = favoriteIds.has(key);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorite ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      const res = await apiFetch('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, productType: product.productType }),
      });
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        res.inWishlist ? next.add(key) : next.delete(key);
        return next;
      });
    } catch (err) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorite ? next.add(key) : next.delete(key);
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
