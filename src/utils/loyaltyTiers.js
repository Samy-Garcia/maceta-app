// Espejo local de los niveles del programa "Macetas Rewards".
//
// La fuente de verdad es el BACKEND: GET /api/loyalty/mine devuelve "tier",
// "tiers" y "approxValueUsd" (ver src/controller/loyaltyController.js del
// backend, constantes LOYALTY_TIERS y HOJA_VALUE_USD). Lo de aquí solo se usa
// como respaldo mientras el servidor no esté desplegado con esos campos, así
// que ambos deben mantenerse iguales.

// 0.10 = 10% de retorno sobre lo gastado (se gana 1 hoja por cada $1)
export const HOJA_VALUE_USD = 0.1;

export const LOYALTY_TIERS = [
  { key: 'Semilla', min: 0 },
  { key: 'Planta', min: 100 },
  { key: 'Bosque', min: 300 },
  { key: 'Jardín Real', min: 600 },
];

// El backend no manda íconos: los decide la app
export const TIER_ICONS = {
  Semilla: 'nutrition-outline',
  Planta: 'leaf-outline',
  Bosque: 'trail-sign-outline',
  'Jardín Real': 'ribbon-outline',
};

export const tierIcon = (key) => TIER_ICONS[key] || 'leaf-outline';

// Devuelve el nivel actual, el siguiente (o null si ya es el máximo),
// el progreso 0..1 dentro del nivel y las hojas que faltan para subir.
export function resolveTier(points = 0) {
  const safePoints = Math.max(0, Math.floor(points || 0));

  let currentIndex = 0;
  for (let i = 0; i < LOYALTY_TIERS.length; i += 1) {
    if (safePoints >= LOYALTY_TIERS[i].min) currentIndex = i;
  }

  const current = LOYALTY_TIERS[currentIndex];
  const next = LOYALTY_TIERS[currentIndex + 1] ?? null;

  if (!next) {
    return { current, next: null, progress: 1, remaining: 0 };
  }

  const span = next.min - current.min;
  const gained = safePoints - current.min;
  const progress = span > 0 ? Math.min(1, Math.max(0, gained / span)) : 1;
  const remaining = Math.max(0, next.min - safePoints);

  return { current, next, progress, remaining };
}

export function hojasToUsd(points = 0) {
  return (Math.max(0, points || 0) * HOJA_VALUE_USD).toFixed(2);
}
