import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

// Ubicación guardada exitosamente
// mini vista de la dirección guardada
export default function LocationSuccessScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const savedLocation = route?.params?.location;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={32} color={colors.white} />
        </View>

        <Text style={styles.title}>Ubicación guardada exitosamente</Text>
        <Text style={styles.subtitle}>
          Tu dirección ha sido registrada correctamente en tu cuenta.
        </Text>

        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={28} color={colors.border} />
          </View>
          <View style={styles.mapInfo}>
            <Ionicons name="home" size={14} color={colors.primary} />
            <View style={styles.mapTextWrapper}>
              <Text style={styles.mapLabel}>{savedLocation?.label ?? 'Dirección guardada'}</Text>
              <Text style={styles.mapPlace}>{savedLocation?.place ?? 'Sin detalles disponibles'}</Text>
            </View>
          </View>
        </View>

        <Button label="Continuar" onPress={() => navigation.navigate('Wishlist')} />

        <Text style={styles.secondaryLink} onPress={() => navigation.navigate('AddressList')}>
          Ver mis direcciones
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    checkCircle: {
      width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 13, color: colors.placeholder, textAlign: 'center', marginBottom: 24, lineHeight: 19 },
    mapCard: { width: '100%', backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
    mapPlaceholder: { height: 100, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    mapInfo: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    mapTextWrapper: { marginLeft: 10 },
    mapLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
    mapPlace: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
    secondaryLink: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 16 },
  });
