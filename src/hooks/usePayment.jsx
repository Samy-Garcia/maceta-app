import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { computeShippingCost, fetchStoreConfig } from '../services/shipping.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { typeLabel } from '../utils/productTypes.js';
import { filterCode, filterName, filterPhoneChars, NAME_REGEX, PHONE_REGEX } from '../utils/validators.js';

// Arma el texto que recibe el backend (shippingAddress es un string)
const composeAddress = ({ addressLine, municipality, department, reference }) =>
  [addressLine.trim(), municipality.trim(), department.trim(), reference.trim()]
    .filter(Boolean)
    .join(', ');

// Pantalla de pago: datos de quien recibe, dirección escrita a mano (o una
// guardada, o retiro en tienda), cupón real de tus canjes de lealtad y
// confirmación del pedido. Sin pasarela de pago: el backend no tiene ninguna,
// así que "Confirmar pedido" llama directo a POST /api/cart/checkout.
export function usePayment(navigation) {
  const { cart, checkout } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState([user?.name, user?.lastName].filter(Boolean).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email] = useState(user?.email ?? '');

  // Dirección escrita a mano. Se guarda por partes porque así la pide el
  // modelo de direcciones del backend y así se puede reutilizar después.
  const [addressLine, setAddressLine] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [department, setDepartment] = useState('');
  const [reference, setReference] = useState('');

  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [selectedPickup, setSelectedPickup] = useState(0);
  const [config, setConfig] = useState(null);
  const [savedVisible, setSavedVisible] = useState(false);

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

  // Si el cliente ya tiene una dirección guardada, se rellena sola la primera vez
  const savedAddresses = user?.addresses || [];
  useEffect(() => {
    if (addressLine || !savedAddresses.length) return;
    const preferred = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    setAddressLine(preferred.addressLine || '');
    setMunicipality(preferred.municipality || '');
    setDepartment(preferred.department || '');
  }, [savedAddresses.length]);

  const pickupLocations = (config?.pickupLocations || []).filter((place) => place.isActive !== false);
  const pickup = pickupLocations[selectedPickup] || null;

  const useSavedAddress = (address) => {
    setSavedVisible(false);
    setAddressLine(address.addressLine || '');
    setMunicipality(address.municipality || '');
    setDepartment(address.department || '');
    setError('');
  };

  // Se bloquea al escribir en vez de avisar hasta el final
  const handleNameChange = (text) => setFullName(filterName(text));
  const handlePhoneChange = (text) => setPhone(filterPhoneChars(text));
  const handleCouponChange = (text) => setCouponInput(filterCode(text));
  const handleMunicipalityChange = (text) => setMunicipality(filterName(text));
  const handleDepartmentChange = (text) => setDepartment(filterName(text));

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
  const baseShipping = computeShippingCost(config, subtotal);
  const shippingCost = isPickup || appliedCoupon?.type === 'shipping' ? 0 : baseShipping;
  const total = Number((subtotal - discount + shippingCost).toFixed(2));

  const freeShippingFrom =
    typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null;
  const qualifiesForFreeShipping = freeShippingFrom != null && subtotal >= freeShippingFrom;
  const missingForFree =
    freeShippingFrom != null ? Number(Math.max(0, freeShippingFrom - subtotal).toFixed(2)) : null;

  const pay = async () => {
    setError('');

    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      setError('Completa el nombre y el teléfono de quien recibe.');
      return;
    }
    if (!NAME_REGEX.test(fullName.trim())) {
      setError('El nombre de quien recibe solo debe contener letras.');
      return;
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      setError('El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).');
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
      if (addressLine.trim().length < 5) {
        setError('Escribe la dirección de entrega (calle, número de casa, colonia).');
        return;
      }
      if (!municipality.trim() || !department.trim()) {
        setError('Completa el municipio y el departamento.');
        return;
      }
      shippingAddress = composeAddress({ addressLine, municipality, department, reference });
    }

    setPaying(true);
    try {
      const confirmed = await checkout(
        shippingAddress,
        phone.trim(),
        appliedCoupon ? couponInput.trim() : undefined,
        shippingCost
      );
      navigation.navigate('OrderConfirmed', {
        order: confirmed,
        breakdown: { subtotal, discount, shippingCost, total },
        destination: { municipality: municipality.trim(), department: department.trim() },
        isPickup,
      });
    } catch (err) {
      // Se marca de dónde viene el mensaje: la app ya no pide ubicación en
      // ningún lado, así que cualquier queja sobre eso sale del servidor y
      // hay que arreglarla allá, no aquí.
      const fromServer = err?.status > 0;
      console.warn('[checkout] rechazado', err?.status, err?.message, { shippingAddress });
      setError(
        fromServer
          ? 'El servidor rechazó el pedido (' + err.status + '): ' + err.message
          : err.message || 'No se pudo confirmar tu pedido.'
      );
    } finally {
      setPaying(false);
    }
  };

  return {
    items,
    itemLabel,
    fullName,
    setFullName: handleNameChange,
    phone,
    setPhone: handlePhoneChange,
    email,
    addressLine,
    setAddressLine,
    municipality,
    setMunicipality: handleMunicipalityChange,
    department,
    setDepartment: handleDepartmentChange,
    reference,
    setReference,
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
    couponInput,
    setCouponInput: handleCouponChange,
    appliedCoupon,
    couponError,
    applyCoupon,
    subtotal,
    discount,
    shippingCost,
    baseShipping,
    total,
    freeShippingFrom,
    qualifiesForFreeShipping,
    missingForFree,
    paying,
    error,
    pay,
  };
}
