import { apiFetch } from './api.js';

// Misma lógica que usa la tienda web (ShippingMap.jsx / Checkout.jsx):
// Config trae la ubicación real de la tienda y el precio por km, /api/route
// calcula la distancia real (OSRM) y Nominatim (OpenStreetMap) convierte
// coordenadas a una dirección legible.
export async function fetchStoreConfig() {
  const list = await apiFetch('/api/config');
  return Array.isArray(list) ? list[0] : list;
}

// El Swagger documenta este endpoint como /api/route, pero en app.js del
// backend está montado como /api/ruta (mismo tipo de typo que /api/post vs
// /api/posts) — se usa la ruta real para que funcione ya. Si se corrige el
// mount en el backend y se despliega, hay que volver a cambiar esto a
// '/api/route'.
export async function fetchRoute(origin, destination) {
  const origen = `${origin.lng},${origin.lat}`;
  const destino = `${destination.lng},${destination.lat}`;
  return apiFetch(`/api/ruta?origen=${origen}&destino=${destino}`);
}

// Nominatim RECHAZA con 403 cualquier petición que no identifique a la
// aplicación en el User-Agent (ver su política de uso). El navegador manda
// el suyo solo, por eso en la tienda web sí funciona; desde el fetch de la
// app hay que ponerlo a mano o todas las direcciones fallan.
export const NOMINATIM_UA = 'Macetas503App/1.0 (https://macetas503.app)';
const NOMINATIM_HEADERS = {
  'Accept-Language': 'es',
  'User-Agent': NOMINATIM_UA,
};

// Convierte la respuesta cruda de Nominatim en lo que necesita la app: el
// texto completo para mostrar y los componentes sueltos que pide el modelo
// Address del backend (addressLine, municipality, department).
export function parseNominatimAddress(data, lat, lng) {
  const addr = data?.address || {};
  const fallbackLabel = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

  return {
    label: data?.display_name || fallbackLabel,
    addressLine:
      [addr.house_number, addr.road].filter(Boolean).join(' ') ||
      addr.road ||
      addr.neighbourhood ||
      addr.suburb ||
      data?.display_name ||
      fallbackLabel,
    municipality: addr.city || addr.town || addr.municipality || addr.county || addr.suburb || '',
    department: addr.state || addr.region || '',
  };
}

export async function reverseGeocode(lat, lng) {
  let res;
  try {
    res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: NOMINATIM_HEADERS }
    );
  } catch {
    throw new Error('No se pudo contactar el servicio de mapas (revisa tu conexión).');
  }
  if (!res.ok) throw new Error('No se pudo obtener la dirección de ese punto.');
  return parseNominatimAddress(await res.json(), lat, lng);
}


// Reglas reales de cobro de envío que tiene configurada la tienda: por km
// recorrido o costo fijo, y gratis a partir de cierto subtotal.
export function computeShippingCost(config, route, subtotal) {
  if (!route) return null;
  const freeFrom = typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null;
  if (freeFrom != null && subtotal >= freeFrom) return 0;
  if ((config?.shippingMode || 'perKm') === 'perKm') {
    return Number(((route.distanciaMetros / 1000) * (config?.pricePerKm || 0)).toFixed(2));
  }
  const flat = config?.flatShippingFee ?? config?.fixedShippingCost ?? 0;
  return Number(Number(flat).toFixed(2));
}
