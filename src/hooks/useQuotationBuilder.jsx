import { useEffect, useMemo, useState } from 'react';
import { fetchMacetas, fetchOtros, fetchPlantas, fetchVelas } from '../services/products.js';
import { normalizeProduct } from '../utils/normalizeProduct.js';
import { createQuotation } from '../services/quotations.js';
import { toISODate } from '../utils/birthDate.js';
import { useToast } from '../context/ToastContext.jsx';

// Los mismos 4 catálogos que usa la web para armar una cotización de evento
// (los combos no entran, igual que allá).
export const QUOTATION_TABS = [
  { key: 'maceta', label: 'Macetas', icon: 'flower-outline' },
  { key: 'vela', label: 'Velas', icon: 'flame-outline' },
  { key: 'planta', label: 'Plantas', icon: 'leaf-outline' },
  { key: 'otro', label: 'Otros', icon: 'cafe-outline' },
];

const FETCHERS = { maceta: fetchMacetas, vela: fetchVelas, planta: fetchPlantas, otro: fetchOtros };
const itemKey = (type, id) => `${type}-${id}`;

// Constructor de "Cotiza tu evento": navega el catálogo por tipo, arma una
// lista de productos con cantidades y envía la solicitud real
// (POST /api/quotations), igual que hace la web.
export function useQuotationBuilder(navigation) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('maceta');
  const [catalogs, setCatalogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [items, setItems] = useState([]);

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [guestCount, setGuestCount] = useState('');
  const [location, setLocation] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all(QUOTATION_TABS.map((tab) => FETCHERS[tab.key]()))
      .then((results) => {
        const next = {};
        QUOTATION_TABS.forEach((tab, index) => {
          next[tab.key] = (results[index] || []).map((item) => normalizeProduct(item, tab.key));
        });
        setCatalogs(next);
      })
      .catch(() => toast.error('No se pudo cargar', 'No se pudo cargar el catálogo de productos.'))
      .finally(() => setLoading(false));
  }, []);

  const products = catalogs[activeTab] || [];

  const getQuantity = (product) => quantities[itemKey(product.productType, product.id)] ?? 1;
  const adjustQuantity = (product, delta) => {
    const key = itemKey(product.productType, product.id);
    setQuantities((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] ?? 1) + delta) }));
  };

  const addItem = (product) => {
    const quantity = getQuantity(product);
    const key = itemKey(product.productType, product.id);
    setItems((prev) => {
      const existing = prev.find((item) => itemKey(item.productType, item.productId) === key);
      if (existing) {
        return prev.map((item) =>
          itemKey(item.productType, item.productId) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productType: product.productType,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          unitPrice: Number(product.price) || 0,
          quantity,
        },
      ];
    });
    toast.success('Agregado', product.name + ' agregado a tu cotización');
  };

  const removeItem = (productType, productId) => {
    setItems((prev) =>
      prev.filter((item) => itemKey(item.productType, item.productId) !== itemKey(productType, productId))
    );
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const submit = async () => {
    setError('');

    if (items.length === 0) {
      setError('Agrega al menos un producto a tu cotización.');
      return;
    }
    if (!eventType || !eventDate) {
      setError('El tipo de evento y la fecha son obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      await createQuotation({
        eventType,
        eventDate: toISODate(eventDate),
        guestCount: guestCount ? Number(guestCount) : undefined,
        location: location.trim(),
        specialRequirements: specialRequirements.trim(),
        items,
      });
      toast.success('¡Solicitud enviada!', 'Te contactaremos pronto con el precio final.');
      navigation.replace('MyQuotations');
    } catch (err) {
      if (err.message?.includes('sesión')) {
        setError('Inicia sesión para pedir una cotización.');
      } else {
        setError(err.message || 'No se pudo enviar la solicitud.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tabs: QUOTATION_TABS,
    activeTab,
    setActiveTab,
    products,
    loading,
    getQuantity,
    adjustQuantity,
    addItem,
    items,
    removeItem,
    total,
    eventType,
    setEventType,
    eventDate,
    setEventDate,
    datePickerOpen,
    setDatePickerOpen,
    guestCount,
    setGuestCount,
    location,
    setLocation,
    specialRequirements,
    setSpecialRequirements,
    submitting,
    error,
    submit,
  };
}
