import { Alert } from 'react-native';
import { useCart } from '../context/CartContext.jsx';

const TYPE_LABELS = { maceta: 'Maceta', vela: 'Vela', planta: 'Planta' };

// Pantalla del carrito: cantidades, eliminar y envío real (calculado en el
// mapa de OpenStreetMap). El pago en sí (datos del cliente, cupón, checkout)
// vive en PaymentScreen — "Confirmar Orden" solo valida que haya productos
// y una dirección elegida antes de pasar para allá.
export function useCartScreen(navigation) {
  const { cart, loading, updateQuantity, removeItem, shippingInfo } = useCart();

  const items = cart.products || [];
  const subtotal = cart.total || 0;
  const shippingCost = shippingInfo?.shippingCost || 0;
  const total = Number((subtotal + shippingCost).toFixed(2));

  const itemLabel = (item) => item.product?.dimensions || item.product?.size || TYPE_LABELS[item.productType];

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return handleRemove(item);
    try {
      await updateQuantity(item._id, nextQuantity);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo actualizar la cantidad.');
    }
  };

  const handleRemove = (item) => {
    Alert.alert('Eliminar producto', `¿Quitar "${item.product?.name}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeItem(item._id);
          } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo eliminar el producto.');
          }
        },
      },
    ]);
  };

  const goToShippingMap = () => navigation.navigate('MapLocation', { returnTo: 'Cart' });

  const goToPayment = () => {
    if (!items.length) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de continuar.');
      return;
    }
    if (!shippingInfo) {
      Alert.alert('Falta la ubicación de envío', 'Marca tu dirección en el mapa antes de continuar.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Elegir en el mapa', onPress: goToShippingMap },
      ]);
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
    itemLabel,
    changeQuantity,
    handleRemove,
    goToShippingMap,
    goToPayment,
  };
}
