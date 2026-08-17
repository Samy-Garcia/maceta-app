import { apiFetch } from './api.js';

// Calificación real de un producto: promedio y conteo calculados por el
// backend a partir de las reseñas de verdad (GET /api/reviews/product/:type/:id)
export const fetchProductReviews = (productType, productId) =>
  apiFetch(`/api/reviews/product/${productType}/${productId}`);
