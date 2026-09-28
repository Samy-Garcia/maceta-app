import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getCards, saveCards, withSingleDefault } from '../services/cardsStorage.js';
import { detectCardBrand } from '../utils/cardBrand.js';
import { filterDigits, filterName, isExpiryExpired, NAME_REGEX } from '../utils/validators.js';
import { useToast } from '../context/ToastContext.jsx';

const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;

// alta/edición de una tarjeta guardada.
// El número completo y el CVV solo viven en el estado de este formulario:
// nunca se guardan. Lo único que se persiste es marca, últimos 4 dígitos,
// titular y vencimiento (ver cardsStorage.js).
export function useEditCard(navigation, cardId) {
  const { user } = useAuth();
  const toast = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [existingLast4, setExistingLast4] = useState('');
  const [isDefault, setIsDefault] = useState(true);
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
        setIsDefault(!!existing.isDefault);
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

  // El titular de una tarjeta es un nombre: nada de números ni símbolos
  const handleHolderChange = (text) => setHolder(filterName(text));
  const handleCvvChange = (text) => setCvv(filterDigits(text).slice(0, 4));

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
    if (!NAME_REGEX.test(holder.trim())) {
      setError('El nombre del titular solo debe contener letras (2-50 caracteres).');
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
    if (isExpiryExpired(expiry)) {
      setError('Esa tarjeta ya está vencida.');
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
      const newId = Date.now().toString();
      const next = cardId
        ? cards.map((c) => (c.id === cardId ? { ...c, ...cardData } : c))
        : [...cards, { id: newId, ...cardData }];
      // La primera tarjeta siempre queda como principal; después manda el switch
      const withDefault = withSingleDefault(next, isDefault ? cardId || newId : undefined);

      await saveCards(user?.email, withDefault);
      toast.success(
        cardId ? 'Tarjeta actualizada' : 'Tarjeta guardada',
        cardData.label + ' terminada en ' + cardData.last4
      );
      navigation.goBack();
    } catch {
      setError('No se pudo guardar la tarjeta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await toast.confirm({
      title: 'Eliminar tarjeta',
      message: '¿Seguro que quieres eliminar esta tarjeta?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    const cards = await getCards(user?.email);
    await saveCards(user?.email, withSingleDefault(cards.filter((c) => c.id !== cardId)));
    toast.success('Tarjeta eliminada');
    navigation.goBack();
  };

  return {
    cardNumber,
    handleCardNumberChange,
    holder,
    setHolder: handleHolderChange,
    expiry,
    handleExpiryChange,
    cvv,
    setCvv: handleCvvChange,
    isDefault,
    setIsDefault,
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
