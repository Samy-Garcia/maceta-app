import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';

// Las claves (key) son las que pasan las pantallas en <BottomTabBar active="..." />
const ITEMS = [
  { key: 'Home', label: 'Inicio', icon: 'home-outline', family: 'ion', route: 'Home' },
  { key: 'Productos', label: 'Catálogo', icon: 'sprout-outline', family: 'mci', route: 'Products' },
  { key: 'Carrito', label: 'Carrito', icon: 'bag-add-outline', family: 'ion', route: 'Cart' },
  { key: 'Pedidos', label: 'Pedidos', icon: 'truck-outline', family: 'mci', route: 'Orders' },
  { key: 'Perfil', label: 'Perfil', icon: 'person-outline', family: 'ion', route: 'Profile' },
];

function TabIcon({ family, name, size, color }) {
  const Icon = family === 'mci' ? MaterialCommunityIcons : Ionicons;
  return <Icon name={name} size={size} color={color} />;
}

// Barra inferior flotante: una píldora elevada sobre el fondo de la pantalla.
// La usan todas las pantallas principales para navegar entre secciones.
export default function BottomTabBar({ active = 'Home' }) {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          const badge = item.key === 'Carrito' && itemCount > 0 ? itemCount : null;
          const tint = isActive ? colors.primary : styles.inactive.color;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View>
                <TabIcon family={item.family} name={item.icon} size={23} color={tint} />
                {badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.label, { color: tint }, isActive && styles.labelActive]}>
                {item.label}
              </Text>

              <View style={[styles.dot, isActive && styles.dotActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    wrapper: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: 'transparent' },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 34,
      paddingVertical: 12,
      paddingHorizontal: 6,
      backgroundColor: isDark ? colors.card : colors.surface,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      shadowColor: '#0B2016',
      shadowOpacity: isDark ? 0 : 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    item: { flex: 1, alignItems: 'center' },
    // Color de los ítems que no están activos (se lee también desde el render)
    inactive: { color: isDark ? colors.placeholder : '#3F4D45' },
    label: { fontSize: 11.5, fontWeight: '600', marginTop: 5 },
    labelActive: { fontWeight: '700' },
    dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: 'transparent' },
    dotActive: { backgroundColor: colors.primary },
    badge: {
      position: 'absolute',
      top: -7,
      right: -11,
      backgroundColor: colors.maroon,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: isDark ? colors.card : colors.surface,
    },
    badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  });
