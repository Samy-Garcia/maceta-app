import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteWompiCard, parseExpiry, saveWompiCard } from '../services/wompi.js';
import { detectCardBrand } from '../utils/cardBrand.js';
import { filterDigits, filterName, isExpiryExpired, NAME_REGEX } from '../utils/validators.js';
import { useToast } from '../context/ToastContext.jsx';

const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2,4}$/;

// Agregar/reemplazar la tarjeta de la cuenta (igual que "Agregar Método de
// Pago" en la web): el backend la tokeniza con Wompi y la guarda ligada al
// cliente, no al teléfono. Solo puede haber una; si ya existe una, guardar
// otra la reemplaza.
export function useEditCard(navigation) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const existing = user?.savedCard || null;

  const handleCardNumberChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(grouped);
  };

  const handleHolderChange = (text) => setHolder(filterName(text));
  const handleCvvChange = (text) => setCvv(filterDigits(text).slice(0, 4));

  const handleExpiryChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setExpiry(formatted);
  };

  const rawDigits = cardNumber.replace(/\D/g, '');
  const previewLast4 = rawDigits.length >= 4 ? rawDigits.slice(-4) : '••••';
  const previewBrand = rawDigits ? detectCardBrand(rawDigits) : 'Tarjeta';

  const handleSave = async () => {
    setError('');

    if (!holder.trim() || !expiry.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    if (!NAME_REGEX.test(holder.trim())) {
      setError('El nombre del titular solo debe contener letras (2-50 caracteres).');
      return;
    }
    if (rawDigits.length !== 16) {
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
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Ingresa un CVV válido.');
      return;
    }

    setSaving(true);
    try {
      const { mesVencimiento, anioVencimiento } = parseExpiry(expiry.trim());
      await saveWompiCard({
        numeroTarjeta: rawDigits,
        cvv,
        mesVencimiento,
        anioVencimiento,
        nombreEnTarjeta: holder.trim(),
      });
      await refreshUser();
      toast.success('Tarjeta guardada', previewBrand + ' terminada en ' + rawDigits.slice(-4));
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la tarjeta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await toast.confirm({
      title: 'Eliminar tarjeta',
      message: '¿Seguro que quieres eliminar tu tarjeta guardada?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteWompiCard();
      await refreshUser();
      toast.success('Tarjeta eliminada');
      navigation.goBack();
    } catch (err) {
      toast.error('No se pudo eliminar', err.message || 'Intenta de nuevo.');
    }
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
    previewLast4,
    previewBrand,
    saving,
    error,
    handleSave,
    handleDelete,
    isEditing: !!existing,
  };
}
