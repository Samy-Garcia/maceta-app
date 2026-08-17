import AsyncStorage from '@react-native-async-storage/async-storage';

// Guarda el envío elegido en el mapa para que sobreviva recargas de la app
// (Fast Refresh en desarrollo, cerrar/abrir la app, etc.) — antes vivía solo
// en memoria (Context) y se perdía en cualquier remount silencioso.
const keyFor = (userId) => `@macetas/shipping_info_${userId || 'guest'}`;

export async function getShippingInfo(userId) {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  return raw ? JSON.parse(raw) : null;
}

export async function saveShippingInfo(userId, info) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(info));
}

export async function clearShippingInfo(userId) {
  await AsyncStorage.removeItem(keyFor(userId));
}
