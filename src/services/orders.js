import { apiFetch } from './api.js';

// Historial real de pedidos del cliente (todo lo que ya no está "activo")
export const fetchMyOrders = () => apiFetch('/api/cart/orders');
