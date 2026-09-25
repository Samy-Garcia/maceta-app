import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useActiveOrders } from './useActiveOrders.jsx';
import { getCards } from '../services/cardsStorage.js';
import { fetchMyLoyalty } from '../services/loyalty.js';
import { useToast } from '../context/ToastContext.jsx';

// Perfil: resume lo que el cliente ya tiene guardado (tarjetas del
// dispositivo, direcciones reales de la cuenta, pedidos en curso y hojas de
// lealtad) y lleva a la pantalla que administra cada cosa.
export function useProfile(navigation) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();
  const activeOrders = useActiveOrders();

  const [cards, setCards] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Al volver de agregar una tarjeta o una dirección, el resumen se actualiza
  useFocusEffect(
    useCallback(() => {
      getCards(user?.email)
        .then(setCards)
        .catch(() => setCards([]));
      fetchMyLoyalty()
        .then((data) => setLoyaltyPoints(data?.points ?? null))
        .catch(() => setLoyaltyPoints(null));
    }, [user?.email])
  );

  const fullName = [user?.name, user?.lastName].filter(Boolean).join(' ') || 'Usuario';
  const addresses = user?.addresses || [];
  // La predeterminada es la que manda el backend; si ninguna lo está, la primera
  const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
  const defaultCard = cards.find((card) => card.isDefault) || cards[0] || null;

  const go = (route, params) => () => navigation.navigate(route, params);

  const handleLogout = async () => {
    const ok = await toast.confirm({
      title: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar tu sesión?',
      confirmLabel: 'Cerrar sesión',
      icon: 'log-out-outline',
      destructive: true,
    });
    if (!ok) return;

    setLoggingOut(true);
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
    } finally {
      setLoggingOut(false);
    }
  };

  return {
    user,
    fullName,
    isDark,
    toggleTheme,
    cards,
    defaultCard,
    addresses,
    defaultAddress,
    activeOrders,
    loyaltyPoints,
    loggingOut,
    goToEditProfile: go('EditProfile'),
    goToCards: go('ManageCards'),
    goToAddCard: go('EditCard'),
    goToEditCard: (card) => navigation.navigate('EditCard', { cardId: card.id }),
    goToAddresses: go('AddressList'),
    goToAddAddress: go('MapLocation', { returnTo: 'Profile' }),
    goToEditAddress: (address) => navigation.navigate('EditLocation', { address }),
    goToOrders: go('Orders'),
    goToWishlist: go('Wishlist'),
    goToLoyalty: go('LoyaltyPoints'),
    goToNotifications: go('NotificationPreferences'),
    goToSecurity: go('ForgotPassword'),
    handleLogout,
  };
}
