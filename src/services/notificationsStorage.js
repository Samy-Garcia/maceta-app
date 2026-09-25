import AsyncStorage from '@react-native-async-storage/async-storage';

// El backend no tiene bandeja de notificaciones: los avisos se arman en la
// app a partir de datos reales (pedidos, hojas de lealtad, novedades del
// catálogo) y de los eventos que la propia app registra aquí, como el cambio
// de contraseña. Lo que se guarda en el dispositivo es qué ya leíste, tus
// preferencias y esos eventos locales.
const readKey = (userId) => `@macetas/notif_read_${userId || 'guest'}`;
const eventsKey = (userId) => `@macetas/notif_events_${userId || 'guest'}`;
const prefsKey = (userId) => `@macetas/notif_prefs_${userId || 'guest'}`;

export const DEFAULT_PREFS = {
  // Nivel de acceso del dispositivo: 'always' | 'app' | 'off'
  access: 'app',
  // Canales por los que se envían los avisos
  push: true,
  email: true,
  whatsapp: true,
  // Categorías de alertas
  pedidos: true,
  seguridad: true,
  novedades: true,
  club: true,
  // Horario no molestar (horas en formato 24h)
  quietHours: true,
  quietFrom: 22,
  quietTo: 8,
};

const parse = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export async function getReadIds(userId) {
  return new Set(await parse(readKey(userId), []));
}

export async function saveReadIds(userId, ids) {
  await AsyncStorage.setItem(readKey(userId), JSON.stringify([...ids]));
}

export async function getPrefs(userId) {
  return { ...DEFAULT_PREFS, ...(await parse(prefsKey(userId), {})) };
}

export async function savePrefs(userId, prefs) {
  await AsyncStorage.setItem(prefsKey(userId), JSON.stringify(prefs));
}

// ¿Los avisos están silenciados en este momento? Lo están si elegiste "No
// permitir" o si estás dentro del horario no molestar. Los pedidos en
// camino son la excepción: esos siempre avisan.
export function notificationsMuted(prefs, now = new Date()) {
  if (prefs?.access === 'off') return true;
  if (!prefs?.quietHours) return false;

  const hour = now.getHours();
  const from = prefs.quietFrom ?? 22;
  const to = prefs.quietTo ?? 8;
  // El rango cruza la medianoche (22:00 → 08:00)
  return from > to ? hour >= from || hour < to : hour >= from && hour < to;
}

export const formatHour = (hour) => {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${hour < 12 ? 'AM' : 'PM'}`;
};

// Eventos que solo la app conoce (ahora mismo, el cambio de contraseña).
// Se guardan los últimos 20 para no crecer sin límite.
export async function getLocalEvents(userId) {
  return parse(eventsKey(userId), []);
}

export async function addLocalEvent(userId, event) {
  const events = await getLocalEvents(userId);
  const next = [{ ...event, date: event.date || new Date().toISOString() }, ...events].slice(0, 20);
  await AsyncStorage.setItem(eventsKey(userId), JSON.stringify(next));
  return next;
}
