import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

//Ingresar Ubicación
//  botón para continuar al listado de
//direcciones guardadas
export default function EnterLocationScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dirección de envío</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.placeholder} />
          <TextInput
            placeholder="Ingrese su ubicación"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={40} color={colors.border} />
        <Text style={styles.mapHint}>Vista previa del mapa</Text>
      </View>

      <View style={styles.footer}>
        <Button label="Ver mis Ubicaciones" onPress={() => navigation.navigate('AddressList')} />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MapLocation', { returnTo: 'LocationSuccess' })}
        >
          <Text style={styles.secondaryButtonText}>Ubicar en el mapa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    searchWrapper: { paddingHorizontal: 20, marginTop: -18 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 44,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchInput: { marginLeft: 8, flex: 1, fontSize: 13, color: colors.text },
    mapPlaceholder: {
      flex: 1,
      margin: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapHint: { fontSize: 12, color: colors.placeholder, marginTop: 8 },
    footer: { paddingHorizontal: 20, paddingBottom: 24 },
    secondaryButton: { alignItems: 'center', marginTop: 14 },
    secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  });
