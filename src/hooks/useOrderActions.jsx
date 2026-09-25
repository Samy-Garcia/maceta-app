import { useState } from 'react';
import { createReview } from '../services/reviews.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Acciones sobre un pedido concreto (repetirlo y reseñarlo). Vive aparte de
// useOrders para que el detalle no tenga que recargar todo el historial.
export function useOrderActions(navigation) {
  const { addToCart, refreshCart } = useCart();
  const toast = useToast();
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
      toast.success('Pedido agregado', 'Los productos de ese pedido están en tu carrito.', {
        actionLabel: 'Ver carrito',
        onAction: () => navigation.navigate('Cart'),
      });
    } catch (err) {
      toast.error(
        'No se pudo repetir el pedido',
        err.message || 'Puede que algún producto ya no tenga stock.'
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
      toast.success('¡Gracias!', 'Tu reseña se publicó correctamente.');
    } catch (err) {
      toast.error('No se pudo publicar', err.message || 'Intenta de nuevo más tarde.');
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
