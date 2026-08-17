import { apiFetch } from './api.js';

// Listas de deseos reales del cliente
export const fetchMyWishlists = () => apiFetch('/api/wishlist/mine');
export const fetchWishlistById = (listId) => apiFetch(`/api/wishlist/mine/${listId}`);
export const removeFromWishlist = (listId, itemId) =>
  apiFetch(`/api/wishlist/lists/${listId}/items/${itemId}`, { method: 'DELETE' });
