import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteAddress } from '../services/addresses.js';
import { removeAddressCoords } from '../services/addressCoords.js';

// Direcciones reales de la cuenta (Client.addresses). Se llenan al elegir
// una ubicación en el mapa desde el carrito, o agregando una nueva aquí.
export function useAddressList(navigation) {
  const { user, refreshUser } = useAuth();
  const addresses = user?.addresses || [];

  const goToAddAddress = () => navigation.navigate('MapLocation', { returnTo: 'AddressList' });

  const handleDelete = (address) => {
    Alert.alert('Eliminar dirección', `¿Quitar "${address.addressLine}" de tus direcciones?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(address._id);
            await removeAddressCoords(user?.email, address._id);
            await refreshUser();
          } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo eliminar la dirección.');
          }
        },
      },
    ]);
  };

  return { addresses, goToAddAddress, handleDelete };
}
