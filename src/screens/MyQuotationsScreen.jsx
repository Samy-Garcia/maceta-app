import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useMyQuotations } from '../hooks/useMyQuotations.jsx';
import { formatQuotationDate, quotationStatusColors } from '../utils/quotationStatus.js';

// "Mis Cotizaciones": igual que /mis-cotizaciones en la web — el historial
// de solicitudes que ha pedido el cliente, con su estado real.
export default function MyQuotationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { quotations, loading, error, retry } = useMyQuotations();

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
        <TouchableOpacity onPress={() => navigation.navigate('Quotations')}>
          <Ionicons name="add-circle-outline" size={23} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Cotizaciones</Text>
        <Text style={styles.subtitle}>
          Solicitudes de cotización para eventos — se piden desde la página de Cotizaciones.
        </Text>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('Quotations')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.newButtonText}>Cotiza un evento</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mis Solicitudes ({quotations.length})</Text>

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
        ) : !error && quotations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={24} color={colors.placeholder} />
            <Text style={styles.emptyText}>Todavía no has pedido ninguna cotización.</Text>
          </View>
        ) : (
          quotations.map((quotation) => {
            const statusColor = quotationStatusColors(quotation.status, isDark);
            return (
              <View key={quotation._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopTexts}>
                    <Text style={styles.cardEvent}>
                      {quotation.eventType} · {formatQuotationDate(quotation.eventDate)}
                    </Text>
                    <Text style={styles.cardDate}>
                      Solicitada el {formatQuotationDate(quotation.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{quotation.status}</Text>
                  </View>
                </View>

                <View style={styles.cardItems}>
                  <Text style={styles.cardItemsLabel}>PRODUCTOS</Text>
                  {(quotation.items || []).map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.productName} x{item.quantity}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {quotation.status !== 'Cotizada' && quotation.estimatedTotal != null ? (
                  <Text style={styles.estimatedTotal}>
                    Estimado: ${Number(quotation.estimatedTotal).toFixed(2)}
                  </Text>
                ) : null}

                {quotation.status === 'Cotizada' && quotation.finalPrice != null ? (
                  <View style={styles.finalBox}>
                    <Text style={styles.finalPrice}>
                      Precio final: ${Number(quotation.finalPrice).toFixed(2)}
                    </Text>
                    {quotation.adminMessage ? (
                      <Text style={styles.finalMessage}>{quotation.adminMessage}</Text>
                    ) : null}
                  </View>
                ) : null}

                {quotation.status === 'Rechazada' && quotation.adminMessage ? (
                  <View style={styles.rejectedBox}>
                    <Text style={styles.rejectedMessage}>{quotation.adminMessage}</Text>
                  </View>
                ) : null}
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

    newButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
      borderRadius: 25,
      marginTop: 16,
      backgroundColor: colors.primary,
    },
    newButtonText: { fontSize: 14, fontWeight: '700', color: colors.white, marginLeft: 8 },

    sectionTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 12 },

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
    emptyText: { fontSize: 12.5, color: colors.placeholder, textAlign: 'center', marginTop: 10 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    cardTopTexts: { flex: 1, marginRight: 10 },
    cardEvent: { fontSize: 14, fontWeight: '700', color: colors.text },
    cardDate: { fontSize: 11, color: colors.placeholder, marginTop: 3 },
    statusPill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
    statusText: { fontSize: 10.5, fontWeight: '700' },

    cardItems: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cardItemsLabel: {
      fontSize: 9,
      letterSpacing: 1,
      fontWeight: '700',
      color: colors.placeholder,
      marginBottom: 6,
    },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    itemName: { flex: 1, fontSize: 12.5, color: colors.text, marginRight: 8 },
    itemPrice: { fontSize: 12.5, color: colors.text },

    estimatedTotal: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'right',
      marginTop: 10,
    },

    finalBox: {
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
    },
    finalPrice: { fontSize: 13.5, fontWeight: '700', color: colors.primary },
    finalMessage: { fontSize: 12.5, color: colors.text, marginTop: 4 },

    rejectedBox: {
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#2F1F1D' : '#F8E2E2',
    },
    rejectedMessage: { fontSize: 12.5, color: isDark ? '#DD9183' : '#A6382F' },
  });
