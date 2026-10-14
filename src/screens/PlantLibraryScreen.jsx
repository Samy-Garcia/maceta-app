import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { fetchPlantas } from '../services/products.js';
import { normalizeProduct } from '../utils/normalizeProduct.js';

// Guía de Cuidado de Plantas: lo mismo que "Plantas y Cuidados" en la web
// (/plantas-y-cuidados). No es un catálogo para comprar: las plantas se
// eligen al comprar una maceta compatible, así que esto es solo información
// — directorio alfabético con buscador, igual que la web.
export default function PlantLibraryScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchPlantas()
      .then((data) => setPlants((data || []).map((item) => normalizeProduct(item, 'planta'))))
      .catch((err) => setError(err.message || 'No se pudieron cargar las plantas.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Agrupa las plantas reales por la primera letra de su nombre (A, B, C...)
  const directory = useMemo(() => {
    const groups = {};
    plants.forEach((plant) => {
      const letter = (plant.name || '?').trim().charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(plant);
    });
    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
  }, [plants]);

  const q = query.trim().toLowerCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Macetas503</Text>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>ASESORÍA BOTÁNICA</Text>
        <Text style={styles.title}>Guía de Cuidado de Plantas</Text>
        <Text style={styles.subtitle}>
          Revisa la hoja de empaque de tu pedido o el correo de confirmación de compra para conocer
          el nombre de tu planta y descubrir qué cuidados necesita para crecer saludable.
        </Text>

        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar plantas..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
          <Ionicons name="search" size={16} color={colors.placeholder} />
        </View>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && plants.length === 0 ? (
          <Text style={styles.stateText}>Todavía no hay plantas registradas en el catálogo.</Text>
        ) : null}

        {Object.entries(directory).map(([letter, letterPlants]) => {
          const filtered = q ? letterPlants.filter((p) => p.name?.toLowerCase().includes(q)) : letterPlants;
          if (!filtered.length) return null;

          return (
            <View key={letter} style={styles.letterGroup}>
              <Text style={styles.letterTitle}>{letter}</Text>
              <View style={styles.grid}>
                {filtered.map((plant) => (
                  <TouchableOpacity
                    key={plant.id}
                    style={styles.plantCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('PlantDetail', { product: plant })}
                  >
                    <View style={styles.plantImageWrap}>
                      {plant.image ? (
                        <Image source={{ uri: plant.image }} style={styles.plantImage} resizeMode="cover" />
                      ) : (
                        <Ionicons name="leaf-outline" size={26} color={colors.placeholder} />
                      )}
                    </View>
                    <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <BottomTabBar active="Home" />
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    headerLogo: { width: 24, height: 24 },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    overline: { fontSize: 9.5, letterSpacing: 1.6, fontWeight: '700', color: colors.maroon, marginTop: 6 },
    title: { fontFamily: SERIF, fontSize: 25, fontWeight: '700', color: colors.text, marginTop: 6 },
    subtitle: { fontSize: 12.5, lineHeight: 19, color: colors.placeholder, marginTop: 10 },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 46,
      borderRadius: 14,
      paddingHorizontal: 14,
      marginTop: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    searchInput: { flex: 1, fontSize: 13.5, color: colors.text, marginRight: 8 },

    loader: { marginVertical: 24 },
    stateBox: { alignItems: 'center', paddingVertical: 18 },
    stateText: { fontSize: 13, color: colors.placeholder, textAlign: 'center', paddingVertical: 12 },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 6 },

    letterGroup: { marginTop: 24 },
    letterTitle: {
      fontFamily: SERIF,
      fontSize: 21,
      fontWeight: '700',
      color: colors.text,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 14,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    plantCard: { width: '31.5%', marginBottom: 16 },
    plantImageWrap: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    plantImage: { width: '100%', height: '100%' },
    plantName: { fontSize: 11.5, fontWeight: '700', color: colors.text, marginTop: 6 },
  });
