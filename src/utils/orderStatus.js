// Traduce el status real que devuelve el backend (Cart.status) a lo que se
// muestra en pantalla. Son los únicos valores reales: "Pendiente", "Aceptado",
// "En proceso", "Completo", "Rechazado" (ver models/cart.js).
export const STATUS_META = {
  Pendiente: { label: 'Confirmado', kind: 'confirmed' },
  Aceptado: { label: 'En preparación', kind: 'progress' },
  'En proceso': { label: 'En camino', kind: 'transit' },
  Completo: { label: 'Entregado', kind: 'done' },
  Rechazado: { label: 'Rechazado', kind: 'rejected' },
};

export const STEPS = ['Confirmado', 'En preparación', 'En camino', 'Entregado'];
export const STATUS_STEP = { Pendiente: 0, Aceptado: 1, 'En proceso': 2, Completo: 3 };

export function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || 'Pendiente', kind: 'confirmed' };
}

export function summarizeItems(order) {
  return (order.products || [])
    .map((item) => `${item.product?.name || 'Producto'}${item.quantity > 1 ? ` x${item.quantity}` : ''}`)
    .join(', ');
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatOrderDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `Hoy, ${date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
