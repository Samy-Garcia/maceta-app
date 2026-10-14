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
import { useMyCustomOrders } from '../hooks/useMyCustomOrders.jsx';
import { getStatusMeta, statusColors, formatOrderDate } from '../utils/orderStatus.js';

// "Mis Personalizaciones": igual que /mis-personalizaciones en la web — las
// solicitudes de personalización que se piden desde la página de una maceta.
export default function MyCustomOrdersScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { customOrders, loading, error, retry, getQuantity, setQuantity, addingId, addToCart } =
    useMyCustomOrders(navigation);

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
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Personalizaciones</Text>
        <Text style={styles.subtitle}>
          Solicitudes de personalización que has pedido sobre macetas — se piden directo desde la página
          del producto.
        </Text>

        <Text style={styles.sectionTitle}>Mis Solicitudes ({customOrders.length})</Text>

        {error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity onPress={retry}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : !error && customOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="brush-outline" size={24} color={colors.placeholder} />
            <Text style={styles.emptyText}>
              Todavía no has pedido ninguna personalización. Si una maceta se puede personalizar, verás
              la opción en su página de producto.
            </Text>
          </View>
        ) : (
          customOrders.map((item) => {
            const meta = getStatusMeta(item.status);
            const color = statusColors(meta.kind, isDark);
            const canAddToCart = item.status === 'Aceptado' && item.price != null;

            return (
              <View key={item._id} style={styles.card}>
                {item.productImage ? (
                  <Image source={{ uri: item.productImage }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImageFallback]}>
                    <Ionicons name="image-outline" size={20} color={colors.placeholder} />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.cardDate}>{formatOrderDate(item.createdAt)}</Text>
                  </View>

                  <View style={styles.tagRow}>
                    <View style={styles.customTag}>
                      <Text style={styles.customTagText}>✎ Personalizado</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: color.bg }]}>
                      <Text style={[styles.statusText, { color: color.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.description}>{item.description}</Text>

                  {item.price != null ? (
                    <Text style={styles.price}>${Number(item.price).toFixed(2)} c/u</Text>
                  ) : null}

                  {item.referenceImage ? (
                    <Image source={{ uri: item.referenceImage }} style={styles.referenceImage} />
                  ) : null}

                  {canAddToCart ? (
                    <View style={styles.addRow}>
                      <TextInput
                        style={styles.qtyInput}
                        value={String(getQuantity(item._id))}
                        onChangeText={(text) => setQuantity(item._id, Number(text.replace(/\D/g, '')) || 1)}
                        keyboardType="number-pad"
                      />
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(item)}
                        disabled={addingId === item._id}
                        activeOpacity={0.85}
                      >
                        {addingId === item._id ? (
                          <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                          <Text style={styles.addButtonText}>Agregar al carrito</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <BottomTabBar active="Perfil" />
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

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    title: { fontFamily: SERIF, fontSize: 25, fontWeight: '700', color: colors.text, marginTop: 6 },
    subtitle: { fontSize: 12.5, lineHeight: 18, color: colors.placeholder, marginTop: 6 },
    sectionTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 12 },

    loader: { marginVertical: 24 },
    stateBox: { alignItems: 'center', paddingVertical: 16 },
    stateText: { fontSize: 13, color: colors.placeholder, textAlign: 'center' },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 8 },

    emptyBox: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 26,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? colors.border : '#DCE2DD',
    },
    emptyText: { fontSize: 12.5, color: colors.placeholder, textAlign: 'center', marginTop: 10, lineHeight: 18 },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardImage: { width: 96, alignSelf: 'stretch' },
    cardImageFallback: { backgroundColor: isDark ? colors.card : '#F1F3F1', alignItems: 'center', justifyContent: 'center' },
    cardBody: { flex: 1, padding: 14 },

    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardName: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.text, marginRight: 8 },
    cardDate: { fontSize: 9.5, color: colors.placeholder },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
    customTag: {
      backgroundColor: colors.primarySoft,
      borderRadius: 7,
      paddingHorizontal: 7,
      paddingVertical: 3,
      marginRight: 6,
      marginBottom: 4,
    },
    customTagText: { fontSize: 9.5, fontWeight: '700', color: colors.primary },
    statusPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 4 },
    statusText: { fontSize: 9.5, fontWeight: '700' },

    description: { fontSize: 11.5, lineHeight: 16, color: colors.placeholder, marginTop: 8 },
    price: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 6 },
    referenceImage: { width: 44, height: 44, borderRadius: 8, marginTop: 8, backgroundColor: colors.card },

    addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    qtyInput: {
      width: 44,
      height: 34,
      borderRadius: 9,
      textAlign: 'center',
      fontSize: 12.5,
      color: colors.text,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
      marginRight: 8,
    },
    addButton: {
      flex: 1,
      height: 34,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    addButtonText: { fontSize: 11.5, fontWeight: '700', color: colors.white },
  });
