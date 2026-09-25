import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useActiveOrders } from '../hooks/useActiveOrders.jsx';

// Cabecera de la tienda (marca + campana + perfil), compartida por Inicio y
// el catálogo. La campana lleva a Pedidos y se enciende si hay alguno en curso.
export default function ShopHeader() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const activeOrders = useActiveOrders();

  return (
    <View style={styles.bar}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.wordmark}>Macetas503</Text>
          <Text style={styles.tagline}>ATELIER BOTÁNICO</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.bell}>
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
          {activeOrders > 0 ? <View style={styles.bellDot} /> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 10,
    },
    brand: { flexDirection: 'row', alignItems: 'center' },
    brandMark: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    brandLogo: { width: 19, height: 19 },
    wordmark: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    tagline: { fontSize: 8.5, letterSpacing: 1.6, fontWeight: '700', color: colors.maroon, marginTop: 1 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    bell: { marginRight: 14 },
    bellDot: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.maroon,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLogo: { width: 20, height: 20 },
  });
