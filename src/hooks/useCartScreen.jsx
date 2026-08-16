import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TYPE_LABELS = { maceta: 'Maceta', vela: 'Vela', planta: 'Planta' };

// Pantalla del carrito: cantidades, eliminar, cupón real (de tus canjes de
// lealtad) y checkout. El envío es siempre gratis en este backend (no hay
// ningún campo de costo de envío en el modelo de Cart), así que no se
// inventa un monto — se muestra tal como es.
export function useCartScreen(navigation) {
  const { cart, loading, updateQuantity, removeItem, checkout } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [redemptions, setRedemptions] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);

  useEffect(() => {
    apiFetch('/api/loyalty/redemptions')
      .then((list) => setRedemptions((list || []).filter((r) => r.status === 'pending')))
      .catch(() => {});
  }, []);

  const matchedRedemption = useMemo(() => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return null;
    return redemptions.find((r) => r.code?.toUpperCase() === code) || null;
  }, [couponCode, redemptions]);

  const items = cart.products || [];
  const subtotal = cart.total || 0;
  const discount =
    matchedRedemption?.type === 'coupon'
      ? Number(((subtotal * matchedRedemption.discountPercent) / 100).toFixed(2))
      : 0;
  const total = Number((subtotal - discount).toFixed(2));

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null;

  const itemLabel = (item) => item.product?.dimensions || item.product?.size || TYPE_LABELS[item.productType];

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return handleRemove(item);
    setBusyItemId(item._id);
    try {
      await updateQuantity(item._id, nextQuantity);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar la cantidad.');
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = (item) => {
    Alert.alert('Eliminar producto', `¿Quitar "${item.product?.name}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setBusyItemId(item._id);
          try {
            await removeItem(item._id);
          } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo eliminar el producto.');
          } finally {
            setBusyItemId(null);
          }
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (!items.length) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
      return;
    }
    if (!defaultAddress) {
      Alert.alert('Falta dirección', 'Agrega una dirección de envío antes de continuar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Agregar dirección', onPress: () => navigation.navigate('EnterLocation') },
      ]);
      return;
    }

    setError('');
    setCheckingOut(true);
    try {
      const confirmed = await checkout(
        defaultAddress.addressLine,
        defaultAddress.phone || user?.phone,
        matchedRedemption ? couponCode.trim() : undefined
      );
      navigation.navigate('OrderConfirmed', { order: confirmed });
    } catch (err) {
      setError(err.message || 'No se pudo confirmar tu pedido.');
    } finally {
      setCheckingOut(false);
    }
  };

  return {
    items,
    loading,
    subtotal,
    discount,
    total,
    couponCode,
    setCouponCode,
    matchedRedemption,
    defaultAddress,
    itemLabel,
    changeQuantity,
    handleRemove,
    handleCheckout,
    checkingOut,
    error,
    busyItemId,
  };
}
