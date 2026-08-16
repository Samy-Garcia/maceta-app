import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.jsx';
import { getCards, saveCards } from '../services/cardsStorage.js';

// lista de tarjetas guardadas (persistidas en el dispositivo con AsyncStorage)
export function useManageCards(navigation) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const stored = await getCards(user?.email);
    setCards(stored);
    setLoading(false);
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goToAddCard = () => navigation.navigate('EditCard');
  const goToEditCard = (card) => navigation.navigate('EditCard', { cardId: card.id });

  const handleDelete = (card) => {
    Alert.alert('Eliminar tarjeta', `¿Eliminar la tarjeta terminada en ${card.last4}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const next = cards.filter((c) => c.id !== card.id);
          setCards(next);
          await saveCards(user?.email, next);
        },
      },
    ]);
  };

  return { cards, loading, goToAddCard, goToEditCard, handleDelete };
}
