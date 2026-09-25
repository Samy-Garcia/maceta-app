import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.jsx';
import { getCards, saveCards, withSingleDefault } from '../services/cardsStorage.js';
import { useToast } from '../context/ToastContext.jsx';

// lista de tarjetas guardadas (persistidas en el dispositivo con AsyncStorage)
export function useManageCards(navigation) {
  const { user } = useAuth();
  const toast = useToast();
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

  const handleDelete = async (card) => {
    const ok = await toast.confirm({
      title: 'Eliminar tarjeta',
      message: '¿Eliminar la tarjeta terminada en ' + card.last4 + '?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    const next = withSingleDefault(cards.filter((c) => c.id !== card.id));
    setCards(next);
    await saveCards(user?.email, next);
    toast.success('Tarjeta eliminada');
  };

  // Cambiar cuál es la tarjeta principal (la que Perfil y el carrito muestran)
  const setDefaultCard = async (card) => {
    const next = withSingleDefault(cards, card.id);
    setCards(next);
    await saveCards(user?.email, next);
  };

  return { cards, loading, goToAddCard, goToEditCard, handleDelete, setDefaultCard };
}
