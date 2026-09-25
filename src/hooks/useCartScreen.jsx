import { useCart } from '../context/CartContext.jsx';
import { typeLabel } from '../utils/productTypes.js';
import { useStoreConfig } from './useStoreConfig.jsx';
import { useToast } from '../context/ToastContext.jsx';


// Pantalla del carrito: cantidades, eliminar y envío real (calculado en el
// mapa de OpenStreetMap). El pago en sí (datos del cliente, cupón, checkout)
// vive en PaymentScreen — "Confirmar Orden" solo valida que haya productos
// y una dirección elegida antes de pasar para allá.
export function useCartScreen(navigation) {
  const { cart, loading, updateQuantity, removeItem, shippingInfo } = useCart();
  const { freeShippingFrom } = useStoreConfig();
  const toast = useToast();

  const items = cart.products || [];
  const subtotal = cart.total || 0;
  const shippingCost = shippingInfo?.shippingCost || 0;
  const total = Number((subtotal + shippingCost).toFixed(2));

  // Cuánto falta para el envío gratis real que tiene configurada la tienda
  const qualifiesForFreeShipping = freeShippingFrom != null && subtotal >= freeShippingFrom;
  const missingForFreeShipping =
    freeShippingFrom != null ? Number(Math.max(0, freeShippingFrom - subtotal).toFixed(2)) : null;
  const freeShippingProgress =
    freeShippingFrom ? Math.min(1, subtotal / freeShippingFrom) : 0;

  const itemLabel = (item) => item.product?.dimensions || item.product?.size || typeLabel(item.productType);

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return handleRemove(item);
    try {
      await updateQuantity(item._id, nextQuantity);
    } catch (err) {
      toast.error('No se pudo actualizar', err.message || 'No se pudo actualizar la cantidad.');
    }
  };

  const handleRemove = async (item) => {
    const ok = await toast.confirm({
      title: 'Eliminar producto',
      message: '¿Quitar "' + (item.product?.name || 'este producto') + '" del carrito?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    try {
      await removeItem(item._id);
    } catch (err) {
      toast.error('No se pudo eliminar', err.message || 'No se pudo eliminar el producto.');
    }
  };

  const goToShippingMap = () => navigation.navigate('MapLocation', { returnTo: 'Cart' });

  const goToPayment = async () => {
    if (!items.length) {
      toast.warning('Carrito vacío', 'Agrega productos antes de continuar.');
      return;
    }
    if (!shippingInfo) {
      const ok = await toast.confirm({
        title: 'Falta la dirección de envío',
        message: 'Marca dónde quieres recibir tu pedido para calcular el envío.',
        confirmLabel: 'Elegir en el mapa',
        icon: 'location-outline',
      });
      if (ok) goToShippingMap();
      return;
      return;
    }
    navigation.navigate('Payment');
  };

  return {
    items,
    loading,
    subtotal,
    shippingCost,
    shippingInfo,
    total,
    freeShippingFrom,
    qualifiesForFreeShipping,
    missingForFreeShipping,
    freeShippingProgress,
    itemLabel,
    changeQuantity,
    handleRemove,
    goToShippingMap,
    goToPayment,
  };
}
