import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { computeShippingCost, fetchRoute, fetchStoreConfig } from '../services/shipping.js';
import { getAddressCoords } from '../services/addressCoords.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { typeLabel } from '../utils/productTypes.js';

// Pantalla de pago: datos del cliente, dirección (mapa, dirección guardada o
// retiro en tienda), cupón real de tus canjes de lealtad y confirmación del
// pedido. Sin pasarela de pago: el backend no tiene ninguna, así que
// "Confirmar pedido" llama directo a POST /api/cart/checkout.
export function usePayment(navigation) {
  const { cart, shippingInfo, shippingInfoLoaded, checkout, setShippingInfo } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState([user?.name, user?.lastName].filter(Boolean).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email] = useState(user?.email ?? '');

  // El backend recibe la dirección como texto, así que se puede afinar a mano
  // después de marcarla en el mapa (número de casa, referencias, etc).
  const [addressText, setAddressText] = useState(shippingInfo?.address || '');
  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [selectedPickup, setSelectedPickup] = useState(0);
  const [config, setConfig] = useState(null);
  const [savedVisible, setSavedVisible] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

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
    fetchStoreConfig().then(setConfig).catch(() => {});
  }, []);

  // Cuando vuelves del mapa, el texto de la dirección se rellena solo
  useEffect(() => {
    if (shippingInfo?.address) {
      setAddressText(shippingInfo.address);
      setError((prev) => (prev.startsWith('No encontramos') || prev.startsWith('Todavía')) ? '' : prev);
    }
  }, [shippingInfo?.address]);

  const pickupLocations = (config?.pickupLocations || []).filter((place) => place.isActive !== false);
  const pickup = pickupLocations[selectedPickup] || null;
  const savedAddresses = user?.addresses || [];

  const goToChangeAddress = () => navigation.navigate('MapLocation', { returnTo: 'Payment' });

  // Elegir una dirección ya guardada. Si tenemos sus coordenadas cacheadas
  // (de cuando se marcó en el mapa), se recalcula el envío real; si no, hay
  // que pasar por el mapa para poder cobrarlo.
  const useSavedAddress = async (address) => {
    setSavedVisible(false);
    setAddressText(address.addressLine || '');
    setError('');

    const coordsMap = await getAddressCoords(user?.email);
    const coords = coordsMap?.[address._id];
    if (!coords || !config?.storeLat) {
      setShippingInfo(null);
      setError('Marca esa dirección en el mapa para poder calcular el envío.');
      return;
    }

    setRecalculating(true);
    try {
      const route = await fetchRoute({ lat: config.storeLat, lng: config.storeLng }, coords);
      setShippingInfo({
        address: address.addressLine || '',
        municipality: address.municipality || '',
        department: address.department || '',
        coords,
        distanceMeters: route.distanciaMetros,
        durationSeconds: route.duracionSegundos,
        shippingCost: computeShippingCost(config, route, cart.total || 0),
      });
    } catch {
      setShippingInfo(null);
      setError('No se pudo calcular el envío a esa dirección. Márcala de nuevo en el mapa.');
    } finally {
      setRecalculating(false);
    }
  };

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
  const itemLabel = (item) => typeLabel(item.productType);
  const subtotal = cart.total || 0;
  const discount =
    appliedCoupon?.type === 'coupon'
      ? Number(((subtotal * appliedCoupon.discountPercent) / 100).toFixed(2))
      : 0;

  const isPickup = deliveryMode === 'pickup';
  const shippingCost = isPickup
    ? 0
    : appliedCoupon?.type === 'shipping'
    ? 0
    : shippingInfo?.shippingCost || 0;
  const total = Number((subtotal - discount + shippingCost).toFixed(2));

  const freeShippingFrom =
    typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null;
  const qualifiesForFreeShipping = freeShippingFrom != null && subtotal >= freeShippingFrom;

  const pay = async () => {
    setError('');

    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      setError('Completa tu nombre y teléfono.');
      return;
    }

    let shippingAddress;
    if (isPickup) {
      if (!pickup) {
        setError('Elige el punto de retiro.');
        return;
      }
      shippingAddress = `Retiro en tienda: ${pickup.name} — ${pickup.address}`;
    } else {
      if (!addressText.trim()) {
        if (!shippingInfoLoaded) {
          setError('Todavía estamos cargando tu dirección de envío, intenta de nuevo en un segundo.');
          return;
        }
        setError('Escribe o marca en el mapa la dirección de entrega.');
        return;
      }
      if (!shippingInfo) {
        setError('Marca la dirección en el mapa para calcular el costo de envío.');
        goToChangeAddress();
        return;
      }
      shippingAddress = addressText.trim();
    }

    setPaying(true);
    try {
      const destination = {
        municipality: shippingInfo?.municipality || '',
        department: shippingInfo?.department || '',
      };
      const confirmed = await checkout(
        shippingAddress,
        phone.trim(),
        appliedCoupon ? couponInput.trim() : undefined
      );
      setShippingInfo(null);
      navigation.navigate('OrderConfirmed', {
        order: confirmed,
        breakdown: { subtotal, discount, shippingCost, total },
        destination,
        isPickup,
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
    addressText,
    setAddressText,
    deliveryMode,
    setDeliveryMode,
    isPickup,
    pickupLocations,
    pickup,
    selectedPickup,
    setSelectedPickup,
    savedAddresses,
    savedVisible,
    setSavedVisible,
    useSavedAddress,
    recalculating,
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
    freeShippingFrom,
    qualifiesForFreeShipping,
    paying,
    error,
    pay,
  };
}
