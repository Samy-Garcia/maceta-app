// Los únicos estados reales que devuelve el backend para una cotización:
// "Pendiente", "Cotizada", "Rechazada" — igual que en la web, sin traducir.
export const QUOTATION_STATUS_META = {
  Pendiente: { kind: 'pending' },
  Cotizada: { kind: 'quoted' },
  Rechazada: { kind: 'rejected' },
};

const COLORS_LIGHT = {
  pending: { bg: '#FDF1DC', text: '#9A6B16' },
  quoted: { bg: '#E3F0E5', text: '#2F6B41' },
  rejected: { bg: '#F8E2E2', text: '#A6382F' },
};

const COLORS_DARK = {
  pending: { bg: '#2E2716', text: '#E3BE72' },
  quoted: { bg: '#1B2A20', text: '#7FCE9B' },
  rejected: { bg: '#2F1F1D', text: '#DD9183' },
};

export function quotationStatusColors(status, isDark) {
  const kind = QUOTATION_STATUS_META[status]?.kind;
  const palette = isDark ? COLORS_DARK : COLORS_LIGHT;
  return palette[kind] || { bg: isDark ? '#2A2A2A' : '#F0F0F0', text: isDark ? '#CFCFCF' : '#555' };
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatQuotationDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export const EVENT_TYPES = ['Boda', 'Cumpleaños', 'Bautizo', 'Baby Shower', 'Graduación', 'Corporativo', 'Otro'];
