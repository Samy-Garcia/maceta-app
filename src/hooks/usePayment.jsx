import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { computeShippingCost, fetchStoreConfig } from '../services/shipping.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { typeLabel } from '../utils/productTypes.js';
import {
  EMAIL_REGEX,
  filterCode,
  filterDigits,
  filterName,
  filterPhoneChars,
  isExpiryExpired,
  NAME_REGEX,
  PHONE_REGEX,
} from '../utils/validators.js';
import {
  normalizeWompiResult,
  parseExpiry,
  payWithNewCard,
  payWithSavedCard,
  saveWompiCard,
} from '../services/wompi.js';

const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2,4}$/;

// Arma el texto que recibe el backend (shippingAddress es un string)
const composeAddress = ({ addressLine, municipality, department, reference }) =>
  [addressLine.trim(), municipality.trim(), department.trim(), reference.trim()]
    .filter(Boolean)
    .join(', ');

// Pantalla de pago: datos de quien recibe, dirección escrita a mano (o una
// guardada, o retiro en tienda), cupón real de tus canjes de lealtad, cobro
// con Wompi (igual que la web: modo de prueba, sin cobro real) y confirmación
// del pedido. El pago se procesa PRIMERO; solo si Wompi lo aprueba se llama a
// POST /api/cart/checkout con el id de esa transacción.
export function usePayment(navigation) {
  const { cart, checkout } = useCart();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

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

  // Método de pago con Wompi (modo de prueba, igual que la web — no se hace
  // ningún cobro real). El cliente solo puede tener UNA tarjeta guardada en su
  // cuenta (la guarda el backend, no el teléfono); si no tiene ninguna, se
  // arranca directo en el formulario de tarjeta nueva.
  const savedCard = user?.savedCard || null;
  const [paymentMode, setPaymentMode] = useState(savedCard ? 'guardada' : 'nueva');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardEmail, setCardEmail] = useState(user?.email ?? '');
  const [saveCard, setSaveCard] = useState(true);

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

  const handleCardNumberChange = (text) => {
    const digits = filterDigits(text).slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  };
  const handleCardHolderChange = (text) => setCardHolder(filterName(text));
  const handleCardCvvChange = (text) => setCardCvv(filterDigits(text).slice(0, 4));
  const handleCardExpiryChange = (text) => {
    const digits = filterDigits(text).slice(0, 4);
    setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const cardDigits = cardNumber.replace(/\D/g, '');

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

    // Pago con Wompi (modo de prueba): si se eligió tarjeta nueva hay que
    // validar sus datos antes de cobrar; con la guardada no hace falta nada
    // más, el backend ya tiene su token.
    if (paymentMode === 'nueva') {
      if (!cardHolder.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardEmail.trim() || cardDigits.length !== 16) {
        setError('Completa los datos de la tarjeta o elige la guardada.');
        return;
      }
      if (!NAME_REGEX.test(cardHolder.trim())) {
        setError('El nombre del titular de la tarjeta solo debe contener letras.');
        return;
      }
      if (!EXPIRY_REGEX.test(cardExpiry.trim())) {
        setError('La fecha de vencimiento de la tarjeta debe tener el formato MM/AA.');
        return;
      }
      if (isExpiryExpired(cardExpiry)) {
        setError('La tarjeta ingresada ya está vencida.');
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        setError('Ingresa un CVV válido.');
        return;
      }
      if (!EMAIL_REGEX.test(cardEmail.trim())) {
        setError('Ingresa un correo válido para el pago.');
        return;
      }
    }

    const confirmedDialog = await toast.confirm({
      title: '¿Confirmar compra?',
      message: `Se procesará un pago de prueba por $${total.toFixed(2)}. No se realizará ningún cobro real a tu tarjeta.`,
      confirmLabel: 'Sí, pagar y confirmar',
      icon: 'card-outline',
    });
    if (!confirmedDialog) return;

    setPaying(true);

    // El pago y la confirmación del pedido son dos llamadas al servidor
    // completamente distintas (Wompi, y luego /api/cart/checkout). Si algo
    // falla, el mensaje dice cuál de las dos fue para no tener que adivinar.
    const nombreCliente =
      paymentMode === 'nueva' ? cardHolder.trim() : [user?.name, user?.lastName].filter(Boolean).join(' ');
    const emailCliente = paymentMode === 'nueva' ? cardEmail.trim() : user?.email;

    let payment;
    try {
      if (paymentMode === 'guardada') {
        payment = await payWithSavedCard({ monto: total, emailCliente, nombreCliente });
      } else {
        const { mesVencimiento, anioVencimiento } = parseExpiry(cardExpiry);
        payment = await payWithNewCard({
          numeroTarjeta: cardDigits,
          cvv: cardCvv,
          mesVencimiento,
          anioVencimiento,
          nombreEnTarjeta: cardHolder.trim(),
          monto: total,
          emailCliente,
          nombreCliente,
        });
      }
    } catch (err) {
      const fromServer = err?.status > 0;
      console.warn('[checkout] pago con Wompi rechazado', err?.status, err?.message);
      setError(
        fromServer
          ? 'Wompi rechazó el pago (' + err.status + '): ' + err.message
          : err.message || 'No se pudo procesar el pago de prueba.'
      );
      setPaying(false);
      return;
    }

    const { approved, transactionId, message } = normalizeWompiResult(payment);
    if (!approved) {
      setError(message || 'La transacción de prueba fue rechazada.');
      setPaying(false);
      return;
    }
    toast.success('Pago de prueba aprobado', 'Transacción ' + transactionId);

    // Guardar la tarjeta nueva no debe tumbar la compra si falla: el pago ya
    // se aprobó, lo único que podría fallar es quedarse sin guardarla para
    // la próxima vez.
    if (paymentMode === 'nueva' && saveCard) {
      try {
        const { mesVencimiento, anioVencimiento } = parseExpiry(cardExpiry);
        await saveWompiCard({
          numeroTarjeta: cardDigits,
          cvv: cardCvv,
          mesVencimiento,
          anioVencimiento,
          nombreEnTarjeta: cardHolder.trim(),
        });
        await refreshUser();
      } catch (saveErr) {
        console.warn('[checkout] no se pudo guardar la tarjeta', saveErr?.message);
      }
    }

    try {
      const confirmed = await checkout({
        shippingAddress,
        contactPhone: phone.trim(),
        couponCode: appliedCoupon ? couponInput.trim() : undefined,
        shippingCost,
        deliveryMethod: isPickup ? 'pickup' : 'shipping',
        pickupLocationId: isPickup ? pickup?._id : undefined,
        wompiTransaccionId: transactionId,
      });
      navigation.navigate('OrderConfirmed', {
        order: confirmed,
        breakdown: { subtotal, discount, shippingCost, total },
        destination: { municipality: municipality.trim(), department: department.trim() },
        isPickup,
      });
    } catch (err) {
      // El pago con Wompi ya se aprobó en este punto (transactionId existe):
      // si falla justo esto, quedó cobrado sin pedido creado — hay que avisar
      // distinto a si nunca se llegó a cobrar.
      const fromServer = err?.status > 0;
      console.warn('[checkout] pedido rechazado tras pago aprobado', err?.status, err?.message, {
        shippingAddress,
        transactionId,
      });
      setError(
        (fromServer
          ? 'El servidor rechazó el pedido (' + err.status + '): ' + err.message
          : err.message || 'No se pudo confirmar tu pedido.') +
          ' Tu pago de prueba (transacción ' +
          transactionId +
          ') ya quedó aprobado.'
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
    savedCard,
    paymentMode,
    setPaymentMode,
    cardNumber,
    setCardNumber: handleCardNumberChange,
    cardHolder,
    setCardHolder: handleCardHolderChange,
    cardExpiry,
    setCardExpiry: handleCardExpiryChange,
    cardCvv,
    setCardCvv: handleCardCvvChange,
    cardEmail,
    setCardEmail,
    saveCard,
    setSaveCard,
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
