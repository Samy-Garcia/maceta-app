import { apiFetch } from './api.js';

// Direcciones reales del cliente (viven dentro de Client.addresses en el backend)
export const addAddress = (data) =>
  apiFetch('/api/loginClient/me/addresses', { method: 'POST', body: JSON.stringify(data) });

export const updateAddress = (addressId, data) =>
  apiFetch(`/api/loginClient/me/addresses/${addressId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAddress = (addressId) =>
  apiFetch(`/api/loginClient/me/addresses/${addressId}`, { method: 'DELETE' });
