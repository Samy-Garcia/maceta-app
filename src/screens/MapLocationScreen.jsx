import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

// direccion de envio
export default function MapLocationScreen({ navigation }) {
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
            placeholder="Buscar en el mapa"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.mapWrapper}>
        <Ionicons name="map" size={40} color={colors.border} />
        <Text style={styles.mapHint}>Vista previa del mapa</Text>
      </View>

      <View style={styles.footer}>
        <Button
          label="Confirmar ubicación"
          onPress={() => navigation.navigate('LocationSuccess')}
        />
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
    searchWrapper: { paddingHorizontal: 20, marginTop: -18, zIndex: 2 },
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
    mapWrapper: {
      flex: 1,
      marginTop: 12,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    mapHint: { fontSize: 12, color: colors.placeholder, marginTop: 8 },
    footer: { paddingHorizontal: 20, paddingBottom: 24 },
  });
