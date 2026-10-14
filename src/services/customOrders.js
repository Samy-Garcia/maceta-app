import { apiFetch } from './api.js';
import { fileToUploadBlob } from '../utils/fileToBlob.js';

// Personalizaciones: solicitar que una maceta se marque con un texto o
// detalle a pedido. Calcado del flujo real de la web (se pide desde la
// página de la maceta, se revisa en "Mis Personalizaciones" y, una vez que
// el taller la acepta con un precio, se agrega al carrito).
export const fetchMyCustomOrders = () => apiFetch('/api/custom-orders/mine');

export async function createCustomOrder({ productId, description, referenceImageUri, referenceImageMimeType }) {
  const formData = new FormData();
  formData.append('productId', productId);
  formData.append('description', description);
  if (referenceImageUri) {
    const fileName = referenceImageUri.split('/').pop() || 'referencia.jpg';
    const mimeType = referenceImageMimeType || 'image/jpeg';
    const blob = await fileToUploadBlob(referenceImageUri, mimeType);
    formData.append('referenceImage', blob, fileName);
  }
  return apiFetch('/api/custom-orders', { method: 'POST', body: formData });
}

export const addCustomOrderToCart = (customOrderId, quantity = 1) =>
  apiFetch('/api/cart/add-custom-order', {
    method: 'POST',
    body: JSON.stringify({ customOrderId, quantity }),
  });
