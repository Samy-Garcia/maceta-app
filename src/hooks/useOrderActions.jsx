import { useState } from 'react';
import { Alert } from 'react-native';
import { createReview } from '../services/reviews.js';
import { useCart } from '../context/CartContext.jsx';

// Acciones sobre un pedido concreto (repetirlo y reseñarlo). Vive aparte de
// useOrders para que el detalle no tenga que recargar todo el historial.
export function useOrderActions(navigation) {
  const { addToCart, refreshCart } = useCart();
  const [reordering, setReordering] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [savingReview, setSavingReview] = useState(false);

  const buyAgain = async (order) => {
    setReordering(order._id);
    try {
      for (const item of order.products) {
        if (!item.product?._id) continue;
        await addToCart(item.product._id, item.productType, item.quantity);
      }
      await refreshCart();
      Alert.alert('Listo', 'Agregamos los productos de ese pedido a tu carrito.', [
        { text: 'Ver carrito', onPress: () => navigation.navigate('Cart') },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err) {
      Alert.alert(
        'Error',
        err.message || 'No se pudo repetir el pedido (puede que algún producto ya no tenga stock).'
      );
    } finally {
      setReordering(null);
    }
  };

  // Solo tiene sentido opinar sobre un pedido ya entregado
  const canReview = (order) => order?.status === 'Completo' && (order.products || []).length > 0;

  const submitReview = async ({ item, rating, comment }) => {
    if (!item?.product?._id) return;
    setSavingReview(true);
    try {
      await createReview({
        productId: item.product._id,
        productType: item.productType,
        rating,
        comment: comment.trim(),
      });
      setReviewOrder(null);
      Alert.alert('Gracias', 'Tu reseña se publicó correctamente.');
    } catch (err) {
      Alert.alert('No se pudo publicar', err.message || 'Intenta de nuevo más tarde.');
    } finally {
      setSavingReview(false);
    }
  };

  return {
    reordering,
    buyAgain,
    canReview,
    reviewOrder,
    setReviewOrder,
    submitReview,
    savingReview,
  };
}
