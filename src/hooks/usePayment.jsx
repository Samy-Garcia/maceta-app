import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TYPE_LABELS = { maceta: 'Maceta', vela: 'Vela', planta: 'Planta' };

// Pantalla de pago: datos del cliente, cupón real (de tus canjes de
// lealtad) y confirmación del pedido. Sin pasarela de pago: el backend no
// la pide, así que "Confirmar Pedido" llama directo a POST /api/cart/checkout.
export function usePayment(navigation) {
  const { cart, shippingInfo, shippingInfoLoaded, checkout, setShippingInfo } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState([user?.name, user?.lastName].filter(Boolean).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email] = useState(user?.email ?? '');

  const [couponInput, setCouponInput] = useState('');
  const [redemptions, setRedemptions] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/loyalty/redemptions')
      .then((list) => setRedemptions((list || []).filter((r) => r.status === 'pending')))
      .catch(() => {});
  }, []);

  // Si el envío llega justo después de un intento fallido (por ejemplo, se
  // estaba recuperando del dispositivo cuando tocaste "Confirmar Pedido"),
  // el error de "falta dirección" queda pegado en pantalla aunque ya se
  // resolvió — esto lo limpia solo en cuanto la dirección está lista.
  useEffect(() => {
    if (shippingInfo?.address) {
      setError((prev) =>
        prev === 'No encontramos una dirección de envío guardada para este pedido. Márcala de nuevo en el mapa.' ||
        prev === 'Todavía estamos cargando tu dirección de envío, intenta de nuevo en un segundo.'
          ? ''
          : prev
      );
    }
  }, [shippingInfo?.address]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const match = redemptions.find((r) => r.code?.toUpperCase() === code);
    if (!match) {
      setAppliedCoupon(null);
      setCouponError('Ese código no es válido o ya fue usado.');
      return;
    }
    setAppliedCoupon(match);
    setCouponError('');
  };

  const items = cart.products || [];
  const itemLabel = (item) => TYPE_LABELS[item.productType];
  const subtotal = cart.total || 0;
  const discount =
    appliedCoupon?.type === 'coupon' ? Number(((subtotal * appliedCoupon.discountPercent) / 100).toFixed(2)) : 0;
  const shippingCost = appliedCoupon?.type === 'shipping' ? 0 : shippingInfo?.shippingCost || 0;
  const total = Number((subtotal - discount + shippingCost).toFixed(2));

  const goToChangeAddress = () => navigation.navigate('MapLocation', { returnTo: 'Payment' });

  const pay = async () => {
    setError('');

    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }
    if (!shippingInfo?.address) {
      if (!shippingInfoLoaded) {
        // Todavía se está recuperando el envío guardado del dispositivo — no es que falte de verdad
        setError('Todavía estamos cargando tu dirección de envío, intenta de nuevo en un segundo.');
        return;
      }
      setError('No encontramos una dirección de envío guardada para este pedido. Márcala de nuevo en el mapa.');
      goToChangeAddress();
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      setError('Completa tu nombre y teléfono.');
      return;
    }

    setPaying(true);
    try {
      const { municipality, department } = shippingInfo;
      const confirmed = await checkout(shippingInfo.address, phone.trim(), appliedCoupon ? couponInput.trim() : undefined);
      setShippingInfo(null);
      navigation.navigate('OrderConfirmed', {
        order: confirmed,
        breakdown: { subtotal, discount, shippingCost, total },
        destination: { municipality, department },
      });
    } catch (err) {
      setError(err.message || 'No se pudo confirmar tu pedido.');
    } finally {
      setPaying(false);
    }
  };

  return {
    items,
    itemLabel,
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    shippingInfo,
    goToChangeAddress,
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponError,
    applyCoupon,
    subtotal,
    discount,
    shippingCost,
    total,
    paying,
    error,
    pay,
  };
}
