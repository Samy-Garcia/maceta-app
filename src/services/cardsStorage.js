import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardado local de tarjetas (el backend todavía no tiene endpoint para esto).
// Nunca se guarda el número completo ni el CVV, solo los últimos 4 dígitos.
const keyFor = (userId) => `@macetas/cards_${userId || 'guest'}`;

export async function getCards(userId) {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function saveCards(userId, cards) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(cards));
}
