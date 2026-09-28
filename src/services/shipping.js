import { apiFetch } from './api.js';

// Configuración real de la tienda: de aquí salen el costo de envío, el monto
// desde el que sale gratis y los puntos de retiro.
export async function fetchStoreConfig() {
  const list = await apiFetch('/api/config');
  return Array.isArray(list) ? list[0] : list;
}

// Reglas reales de cobro que tiene configurada la tienda.
//
// La dirección se escribe a mano, así que no hay coordenadas y no se puede
// cobrar por kilómetro recorrido. Cuando la tienda está en modo 'perKm' se
// aplica su tarifa fija configurada (flatShippingFee / fixedShippingCost),
// que es el único monto real disponible sin ubicar el punto en un mapa.
// El envío gratis por monto mínimo sí se respeta siempre.
export function computeShippingCost(config, subtotal) {
  const freeFrom =
    typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null;
  if (freeFrom != null && subtotal >= freeFrom) return 0;

  const flat = config?.flatShippingFee ?? config?.fixedShippingCost ?? 0;
  return Number(Number(flat).toFixed(2));
}

// Cuánto falta para que el envío salga gratis (null si no hay mínimo configurado)
export function missingForFreeShipping(config, subtotal) {
  const freeFrom =
    typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null;
  if (freeFrom == null) return null;
  return Number(Math.max(0, freeFrom - subtotal).toFixed(2));
}
