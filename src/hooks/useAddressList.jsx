import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteAddress, updateAddress } from '../services/addresses.js';
import { useToast } from '../context/ToastContext.jsx';

// Direcciones reales de la cuenta (Client.addresses). Se escriben a mano,
// aquí o al momento de hacer un pedido.
export function useAddressList(navigation) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const addresses = user?.addresses || [];
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  // Sin mapa: la dirección se escribe a mano en el mismo formulario que edita
  const goToAddAddress = () => navigation.navigate('EditLocation');
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
      await refreshUser();
      toast.success('Dirección eliminada');
    } catch (err) {
      toast.error('No se pudo eliminar', err.message || 'Intenta de nuevo.');
    }
  };

  const handleSetDefault = async (address) => {
    setSettingDefaultId(address._id);
    try {
      await updateAddress(address._id, { ...address, isDefault: true });
      await refreshUser();
      toast.success('Dirección principal actualizada');
    } catch (err) {
      toast.error('No se pudo actualizar', err.message || 'Intenta de nuevo.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  return {
    addresses,
    goToAddAddress,
    goToEditAddress,
    handleDelete,
    handleSetDefault,
    settingDefaultId,
  };
}
