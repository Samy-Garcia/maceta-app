import { useAuth } from '../context/AuthContext.jsx';
import { deleteAddress } from '../services/addresses.js';
import { removeAddressCoords } from '../services/addressCoords.js';
import { useToast } from '../context/ToastContext.jsx';

// Direcciones reales de la cuenta (Client.addresses). Se llenan al elegir
// una ubicación en el mapa desde el carrito, o agregando una nueva aquí.
export function useAddressList(navigation) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const addresses = user?.addresses || [];

  const goToAddAddress = () => navigation.navigate('MapLocation', { returnTo: 'AddressList' });
  const goToEditAddress = (address) => navigation.navigate('EditLocation', { address });

  const handleDelete = async (address) => {
    const ok = await toast.confirm({
      title: 'Eliminar dirección',
      message: '¿Quitar "' + address.addressLine + '" de tus direcciones?',
      confirmLabel: 'Eliminar',
      icon: 'trash-outline',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteAddress(address._id);
      await removeAddressCoords(user?.email, address._id);
      await refreshUser();
      toast.success('Dirección eliminada');
    } catch (err) {
      toast.error('No se pudo eliminar', err.message || 'Intenta de nuevo.');
    }
  };

  return { addresses, goToAddAddress, goToEditAddress, handleDelete };
}
