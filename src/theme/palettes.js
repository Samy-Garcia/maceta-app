// Paletas de colores: claro y oscuro.
// "white" se mantiene fijo en ambos temas: se usa como color de texto/ícono
// sobre fondos de marca (primary/maroon), que no cambian entre temas.
// "surface" es el fondo de tarjetas/inputs/controles (antes reutilizaba "white").
export const lightColors = {
  primary: '#1B4D2E',
  primaryDark: '#0F3620',
  primarySoft: '#E7F0EA',
  maroon: '#6E1B2B',
  maroonDark: '#4C1220',
  accentPink: '#D6236B',
  background: '#FCEAEA',
  card: '#FDF6F6',
  surface: '#FFFFFF',
  border: '#D9C7C4',
  text: '#1A1A1A',
  placeholder: '#77837B',
  white: '#FFFFFF',
  overlay: 'rgba(27, 77, 46, 0.05)',
  shopBg: '#F5F1EC',
};

// Modo oscuro: carbón con tinte botánico en vez del gris cálido de antes.
// Los dos colores de marca se aclaran a propósito porque aquí cumplen doble
// papel — fondo de botón con texto blanco encima Y color de acento sobre
// fondos oscuros — y el verde/vino originales quedaban ilegibles en el
// segundo caso.
export const darkColors = {
  primary: '#2E7D4F',
  primaryDark: '#1B4D2E',
  primarySoft: '#14211A',
  maroon: '#B35F4B',
  maroonDark: '#8C4636',
  accentPink: '#E2698F',
  background: '#0F1410',
  card: '#161C17',
  surface: '#1C231D',
  border: '#2B342C',
  text: '#ECF1EC',
  placeholder: '#93A395',
  white: '#FFFFFF',
  overlay: 'rgba(255, 255, 255, 0.06)',
  shopBg: '#121812',
};
