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

// La política de uso de Nominatim pide identificar la app (User-Agent o
// Referer válido); en RN no siempre se puede sobreescribir el User-Agent,
// así que se manda un Referer explícito para no quedar bloqueados.
const NOMINATIM_HEADERS = { 'Accept-Language': 'es', Referer: 'https://macetas503.app' };

export async function reverseGeocode(lat, lng) {
  let res;
  try {
    res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: NOMINATIM_HEADERS }
    );
  } catch {
    throw new Error('No se pudo contactar el servicio de mapas (revisa tu conexión).');
  }
  if (!res.ok) throw new Error('No se pudo obtener la dirección de ese punto.');
  const data = await res.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export async function searchAddress(query) {
  let res;
  try {
    res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sv&q=${encodeURIComponent(query)}`,
      { headers: NOMINATIM_HEADERS }
    );
  } catch {
    throw new Error('No se pudo contactar el servicio de mapas (revisa tu conexión).');
  }
  if (!res.ok) throw new Error('No se pudo buscar esa dirección.');
  const results = await res.json();
  if (!results?.length) return null;
  return { lat: Number(results[0].lat), lng: Number(results[0].lon), label: results[0].display_name };
}
