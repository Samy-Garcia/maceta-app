import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache local de coordenadas por dirección guardada. El modelo Address del
// backend no tiene lat/lng, así que las coordenadas que ya obtuvimos al
// marcarlas en el mapa se guardan aquí para poder recalcular el envío sin
// tener que geocodificar la dirección de nuevo.
const keyFor = (userId) => `@macetas/address_coords_${userId || 'guest'}`;

export async function getAddressCoords(userId) {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  return raw ? JSON.parse(raw) : {};
}

export async function saveAddressCoords(userId, addressId, coords) {
  const all = await getAddressCoords(userId);
  all[addressId] = coords;
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(all));
}

export async function removeAddressCoords(userId, addressId) {
  const all = await getAddressCoords(userId);
  delete all[addressId];
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(all));
}
