import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { fetchProductDetail } from '../services/products.js';
import { normalizeProduct } from '../utils/normalizeProduct.js';

// Detalle de una planta dentro de la guía (igual a /plantas-y-cuidados/:id en
// la web): sus 4 categorías reales de cuidado, escritas por el admin, y el
// aviso de que no se vende sola — se elige al comprar una maceta compatible.
export default function PlantDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const summary = route?.params?.product || {};

  const [plant, setPlant] = useState(summary.id ? summary : null);
  const [loading, setLoading] = useState(!!summary.id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!summary.id) return;
    fetchProductDetail('planta', summary.id)
      .then((data) => setPlant(normalizeProduct(data, 'planta')))
      .catch((err) => setError(err.message || 'No se pudo cargar la planta.'))
      .finally(() => setLoading(false));
  }, [summary.id]);

  const careRows = plant
    ? [
        { key: 'careLight', icon: 'sunny-outline', title: 'Luz', text: plant.careLight },
        { key: 'careWater', icon: 'water-outline', title: 'Riego', text: plant.careWater },
        { key: 'careSoil', icon: 'leaf-outline', title: 'Suelo', text: plant.careSoil },
        { key: 'careTemperature', icon: 'thermometer-outline', title: 'Temperatura', text: plant.careTemperature },
      ].filter((row) => row.text)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plantas y Cuidados</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error || !plant ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error || 'Planta no encontrada'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Volver a la guía</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageWrap}>
            {plant.image ? (
              <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
            ) : (
              <Ionicons name="leaf-outline" size={56} color={colors.placeholder} />
            )}
          </View>

          <Text style={styles.name}>{plant.name}</Text>
          {plant.dimensions ? <Text style={styles.size}>Tamaño: {plant.dimensions}</Text> : null}
          {typeof plant.price === 'number' ? (
            <Text style={styles.price}>${plant.price.toFixed(2)}</Text>
          ) : null}

          {careRows.length === 0 ? (
            <Text style={styles.emptyCare}>
              Todavía no hay instrucciones de cuidado cargadas para esta planta.
            </Text>
          ) : (
            <View style={styles.careList}>
              {careRows.map((row) => (
                <View key={row.key} style={styles.careRow}>
                  <View style={styles.careIcon}>
                    <Ionicons name={row.icon} size={19} color={colors.text} />
                  </View>
                  <View style={styles.careTexts}>
                    <Text style={styles.careTitle}>{row.title}</Text>
                    <Text style={styles.careText}>{row.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bundleBox}>
            <Text style={styles.bundleText}>
              Esta planta se elige al comprar una <Text style={styles.bundleBold}>maceta compatible</Text>,
              no se vende por separado.
            </Text>
            <TouchableOpacity
              style={styles.bundleButton}
              onPress={() => navigation.navigate('Collection', { tab: 'maceta' })}
              activeOpacity={0.85}
            >
              <Text style={styles.bundleButtonText}>Ver macetas disponibles</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    headerTitle: { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: colors.text },

    loader: { marginTop: 60 },
    stateBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
    stateText: { fontSize: 13.5, color: colors.placeholder, textAlign: 'center' },
    retryText: { fontSize: 13.5, fontWeight: '700', color: colors.primary, marginTop: 12 },

    content: { paddingHorizontal: 20, paddingBottom: 30 },

    imageWrap: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginTop: 6,
    },
    image: { width: '100%', height: '100%' },

    name: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 18 },
    size: { fontSize: 12.5, color: colors.placeholder, marginTop: 4 },
    price: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: 8 },

    emptyCare: { fontSize: 12.5, fontStyle: 'italic', color: colors.placeholder, marginTop: 20 },

    careList: { marginTop: 22 },
    careRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
    careIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    careTexts: { flex: 1 },
    careTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    careText: { fontSize: 12.5, lineHeight: 18, color: colors.placeholder, marginTop: 3 },

    bundleBox: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    bundleText: { fontSize: 13, lineHeight: 19, color: colors.text },
    bundleBold: { fontWeight: '700' },
    bundleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      height: 42,
      paddingHorizontal: 16,
      borderRadius: 21,
      marginTop: 14,
      backgroundColor: colors.primary,
    },
    bundleButtonText: { fontSize: 13, fontWeight: '700', color: colors.white, marginRight: 7 },
  });
