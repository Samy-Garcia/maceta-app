import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext.jsx';
import { getCards, saveCards } from '../services/cardsStorage.js';
import { detectCardBrand } from '../utils/cardBrand.js';

const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;

// alta/edición de una tarjeta guardada.
// El número completo y el CVV solo viven en el estado de este formulario:
// nunca se guardan. Lo único que se persiste es marca, últimos 4 dígitos,
// titular y vencimiento (ver cardsStorage.js).
export function useEditCard(navigation, cardId) {
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [existingLast4, setExistingLast4] = useState('');
  const [loading, setLoading] = useState(!!cardId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cardId) return;
    (async () => {
      const cards = await getCards(user?.email);
      const existing = cards.find((c) => c.id === cardId);
      if (existing) {
        setHolder(existing.holder);
        setExpiry(existing.expiry);
        setExistingLast4(existing.last4);
        setCardNumber(`•••• •••• •••• ${existing.last4}`);
      }
      setLoading(false);
    })();
  }, [cardId, user?.email]);

  const handleCardNumberChange = (text) => {
    // si el usuario empieza a escribir sobre el número enmascarado, se limpia
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(grouped);
  };

  const handleExpiryChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setExpiry(formatted);
  };

  const rawDigits = cardNumber.replace(/\D/g, '');
  const previewLast4 = rawDigits.length >= 4 ? rawDigits.slice(-4) : existingLast4 || '••••';
  const previewBrand = rawDigits ? detectCardBrand(rawDigits) : 'Tarjeta';

  const handleSave = async () => {
    setError('');
    const isUntouchedMasked = cardId && rawDigits.length < 16 && existingLast4;

    if (!holder.trim() || !expiry.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    if (!isUntouchedMasked && rawDigits.length !== 16) {
      setError('Ingresa los 16 dígitos de la tarjeta.');
      return;
    }
    if (!EXPIRY_REGEX.test(expiry.trim())) {
      setError('La fecha de vencimiento debe tener el formato MM/AA.');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv) && !isUntouchedMasked) {
      setError('Ingresa un CVV válido.');
      return;
    }

    setSaving(true);
    try {
      const cards = await getCards(user?.email);
      const cardData = {
        label: isUntouchedMasked ? cards.find((c) => c.id === cardId)?.label : detectCardBrand(rawDigits),
        last4: isUntouchedMasked ? existingLast4 : rawDigits.slice(-4),
        holder: holder.trim(),
        expiry: expiry.trim(),
      };
      const next = cardId
        ? cards.map((c) => (c.id === cardId ? { ...c, ...cardData } : c))
        : [...cards, { id: Date.now().toString(), ...cardData }];

      await saveCards(user?.email, next);
      navigation.goBack();
    } catch {
      setError('No se pudo guardar la tarjeta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar tarjeta', '¿Seguro que quieres eliminar esta tarjeta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const cards = await getCards(user?.email);
          await saveCards(user?.email, cards.filter((c) => c.id !== cardId));
          navigation.goBack();
        },
      },
    ]);
  };

  return {
    cardNumber,
    handleCardNumberChange,
    holder,
    setHolder,
    expiry,
    handleExpiryChange,
    cvv,
    setCvv,
    previewLast4,
    previewBrand,
    loading,
    saving,
    error,
    handleSave,
    handleDelete,
    isEditing: !!cardId,
  };
}
