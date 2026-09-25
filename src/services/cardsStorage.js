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

// Deja una sola tarjeta marcada como principal (la que se usa por defecto).
// Si ninguna lo está, la primera de la lista toma ese papel.
export function withSingleDefault(cards, defaultId) {
  if (!cards.length) return cards;
  const targetId = cards.some((c) => c.id === defaultId)
    ? defaultId
    : (cards.find((c) => c.isDefault) || cards[0]).id;
  return cards.map((card) => ({ ...card, isDefault: card.id === targetId }));
}
