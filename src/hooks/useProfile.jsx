import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

export const PROFILE_MENU_ITEMS = [
  { key: 'orders', icon: 'receipt-outline', label: 'Mis pedidos', subtitle: 'Ver historial de compras', route: 'Orders' },
  { key: 'wishlist', icon: 'heart-outline', label: 'Mi lista de deseos', subtitle: 'Productos guardados', route: 'Wishlist' },
  { key: 'cards', icon: 'card-outline', label: 'Métodos de pago', subtitle: 'Tarjetas guardadas', route: 'ManageCards' },
  { key: 'addresses', icon: 'location-outline', label: 'Direcciones', subtitle: 'Ubicaciones guardadas', route: 'AddressList' },
  { key: 'loyalty', icon: 'leaf-outline', label: 'Puntos de lealtad', subtitle: 'Tus hojas y recompensas', route: 'LoyaltyPoints' },
];

export function useProfile(navigation) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const fullName = [user?.name, user?.lastName].filter(Boolean).join(' ') || 'Usuario';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return {
    user,
    fullName,
    isDark,
    toggleTheme,
    menuItems: PROFILE_MENU_ITEMS,
    handleLogout,
  };
}
