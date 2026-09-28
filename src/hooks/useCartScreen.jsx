import { useCart } from '../context/CartContext.jsx';
import { typeLabel } from '../utils/productTypes.js';
import { useStoreConfig } from './useStoreConfig.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { computeShippingCost } from '../services/shipping.js';

// Pantalla del carrito: cantidades, eliminar y el envío estimado con la
// tarifa real que tiene configurada la tienda. El pago en sí (dirección,
// datos de quien recibe, cupón y checkout) vive en PaymentScreen.
export function useCartScreen(navigation) {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { config, freeShippingFrom } = useStoreConfig();
  const toast = useToast();

  const items = cart.products || [];
  const subtotal = cart.total || 0;
  // Mismo cálculo que hará el checkout, para que el total no cambie de un
  // paso a otro: tarifa fija de la tienda, gratis desde el mínimo configurado.
  const shippingCost = computeShippingCost(config, subtotal);
  const total = Number((subtotal + shippingCost).toFixed(2));

  // Cuánto falta para el envío gratis real que tiene configurada la tienda
  const qualifiesForFreeShipping = freeShippingFrom != null && subtotal >= freeShippingFrom;
  const missingForFreeShipping =
    freeShippingFrom != null ? Number(Math.max(0, freeShippingFrom - subtotal).toFixed(2)) : null;
  const freeShippingProgress = freeShippingFrom ? Math.min(1, subtotal / freeShippingFrom) : 0;

  const itemLabel = (item) =>
    item.product?.dimensions || item.product?.size || typeLabel(item.productType);

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

  const goToPayment = () => {
    if (!items.length) {
      toast.warning('Carrito vacío', 'Agrega productos antes de continuar.');
      return;
    }
    navigation.navigate('Payment');
  };

  return {
    items,
    loading,
    subtotal,
    shippingCost,
    total,
    freeShippingFrom,
    qualifiesForFreeShipping,
    missingForFreeShipping,
    freeShippingProgress,
    itemLabel,
    changeQuantity,
    handleRemove,
    goToPayment,
  };
}
