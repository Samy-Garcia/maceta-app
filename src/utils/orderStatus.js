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

// Un pedido sigue 'en curso' mientras no esté entregado ni rechazado
export const ACTIVE_STATUSES = ['Pendiente', 'Aceptado', 'En proceso'];
export const FINISHED_STATUSES = ['Completo', 'Rechazado'];

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

// Colores de la etiqueta de estado. En oscuro se usan fondos apagados con
// texto claro: los pasteles del tema claro deslumbran sobre fondo negro.
const STATUS_COLORS_LIGHT = {
  confirmed: { bg: '#FDF1DC', text: '#9A6B16' },
  progress: { bg: '#E6F0E9', text: '#1B4D2E' },
  transit: { bg: '#E3EAF8', text: '#33528F' },
  done: { bg: '#E3F0E5', text: '#2F6B41' },
  rejected: { bg: '#F8E2E2', text: '#A6382F' },
};

const STATUS_COLORS_DARK = {
  confirmed: { bg: '#2E2716', text: '#E3BE72' },
  progress: { bg: '#1B2A20', text: '#6FBE8C' },
  transit: { bg: '#1B2333', text: '#8FAEE8' },
  done: { bg: '#1B2A20', text: '#7FCE9B' },
  rejected: { bg: '#2F1F1D', text: '#DD9183' },
};

export function statusColors(kind, isDark) {
  const palette = isDark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  return palette[kind] || palette.confirmed;
}
