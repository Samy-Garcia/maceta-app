import { apiFetch } from './api.js';

// Catálogo real del backend: Macetas, Velas (/api/candles) y Plantas
// (/api/plants) son colecciones separadas pero se tratan como un mismo
// "catálogo de productos" en la app.
//
// El Swagger documenta el endpoint de macetas como /api/posts (plural,
// igual que candles/plants), pero en app.js del backend está montado por
// error como /api/post (singular) — así quedó desplegado en Render. Se usa
// aquí la ruta real para que funcione ya; si en algún momento se corrige el
// mount en el backend y se vuelve a desplegar, hay que cambiar esto a
// '/api/posts'.
export const fetchMacetas = () => apiFetch('/api/post');
export const fetchVelas = () => apiFetch('/api/candles');
export const fetchPlantas = () => apiFetch('/api/plants');
export const fetchBestsellers = (limit = 12) => apiFetch(`/api/orders/bestsellers?limit=${limit}`);
export const fetchOffers = () => apiFetch('/api/offers');
export const fetchFavoriteIds = () => apiFetch('/api/wishlist/favorites');

// Detalle completo de un producto (la lista solo trae lo básico)
const DETAIL_FETCHERS = {
  maceta: (id) => apiFetch(`/api/post/${id}`),
  vela: (id) => apiFetch(`/api/candles/${id}`),
  planta: (id) => apiFetch(`/api/plants/${id}`),
};
export const fetchProductDetail = (productType, id) => DETAIL_FETCHERS[productType](id);
