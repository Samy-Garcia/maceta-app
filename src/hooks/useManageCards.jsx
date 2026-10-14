import { useAuth } from '../context/AuthContext.jsx';
import { deleteWompiCard } from '../services/wompi.js';
import { useToast } from '../context/ToastContext.jsx';

// La tarjeta de la cuenta (tokenizada con Wompi, igual que en la web): el
// backend solo guarda una por cliente, ligada a su cuenta, no al teléfono.
export function useManageCards(navigation) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const card = user?.savedCard || null;

  const goToAddCard = () => navigation.navigate('EditCard');

  const handleDelete = async () => {
    const ok = await toast.confirm({
      title: 'Eliminar tarjeta',
      message: '¿Eliminar tu tarjeta guardada terminada en ' + (card?.maskedNumber?.slice(-4) || '') + '?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteWompiCard();
      await refreshUser();
      toast.success('Tarjeta eliminada');
    } catch (err) {
      toast.error('No se pudo eliminar', err.message || 'Intenta de nuevo.');
    }
  };

  return { card, loading: false, goToAddCard, handleDelete };
}
