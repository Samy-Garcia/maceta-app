import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors.jsx';

const ITEMS = [
  { key: 'Home', label: 'Home', icon: 'home', route: 'Home' },
  { key: 'Productos', label: 'Productos', icon: 'leaf', route: 'Products' },
  { key: 'Carrito', label: 'Carrito', icon: 'cart', route: 'Cart', badge: 2 },
  { key: 'Pedidos', label: 'Pedidos', icon: 'receipt', route: 'Orders' },
  { key: 'Perfil', label: 'Perfil', icon: 'person', route: 'Profile' },
];

// Barra inferior
//puede navegar entre pantallas 
export default function BottomTabBar({ active = 'Home' }) {
  const navigation = useNavigation();

  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
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
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
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

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingBottom: 10,
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
