import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const ITEMS = [
  { key: 'Home', label: 'Home', icon: 'home', route: 'Home' },
  { key: 'Productos', label: 'Productos', icon: 'leaf', route: 'Products' },
  { key: 'Carrito', label: 'Carrito', icon: 'cart', route: 'Cart' },
  { key: 'Pedidos', label: 'Pedidos', icon: 'receipt', route: 'Orders' },
  { key: 'Perfil', label: 'Perfil', icon: 'person', route: 'Profile' },
];

// Barra inferior
//puede navegar entre pantallas
export default function BottomTabBar({ active = 'Home' }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        const badge = item.key === 'Carrito' && itemCount > 0 ? itemCount : null;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? colors.primary : colors.placeholder}
              />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      paddingTop: 8,
    },
    item: { flex: 1, alignItems: 'center' },
    label: { fontSize: 10, color: colors.placeholder, marginTop: 2 },
    labelActive: { color: colors.primary, fontWeight: '700' },
    badge: {
      position: 'absolute',
      top: -4,
      right: -8,
      backgroundColor: colors.maroon,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
  });
