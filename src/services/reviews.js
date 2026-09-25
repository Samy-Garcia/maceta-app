import { apiFetch } from './api.js';

// Calificación real de un producto: promedio y conteo calculados por el
// backend a partir de las reseñas de verdad (GET /api/reviews/product/:type/:id)
export const fetchProductReviews = (productType, productId) =>
  apiFetch(`/api/reviews/product/${productType}/${productId}`);

// Dejar una reseña de un producto comprado (POST /api/reviews, requiere sesión).
// El backend responde con el mensaje de error si falta algún campo.
export const createReview = ({ productId, productType, rating, comment }) =>
  apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ productId, productType, rating, comment }),
  });
