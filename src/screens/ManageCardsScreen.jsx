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
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useManageCards } from '../hooks/useManageCards.jsx';

export default function ManageCardsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { cards, loading, goToAddCard, goToEditCard, handleDelete, setDefaultCard } =
    useManageCards(navigation);

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>Métodos de pago</Text>
          <View style={styles.walletPill}>
            <Ionicons name="phone-portrait-outline" size={12} color={colors.primary} />
            <Text style={styles.walletPillText}>EN ESTE EQUIPO</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerDot} />
            <Text style={styles.bannerEyebrow}>TUS TARJETAS</Text>
            <Ionicons name="card-outline" size={20} color="#E4D7A8" />
          </View>
          <Text style={styles.bannerTitle}>Gestiona tus tarjetas</Text>
          <Text style={styles.bannerText}>
            Se guardan solo en este teléfono para que no tengas que escribirlas de nuevo. Nunca se
            guarda el número completo ni el CVV.
          </Text>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Tarjetas guardadas</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {cards.length} {cards.length === 1 ? 'TARJETA' : 'TARJETAS'}
            </Text>
          </View>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {!loading && cards.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="card-outline" size={24} color={colors.placeholder} />
            <Text style={styles.emptyText}>
              Todavía no tienes tarjetas guardadas en este teléfono.
            </Text>
          </View>
        ) : null}

        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Ionicons name="card" size={18} color={colors.primary} />
              </View>

              <View style={styles.cardTitles}>
                <View style={styles.cardNameRow}>
                  <Text style={styles.cardLabel} numberOfLines={1}>{card.label}</Text>
                  {card.isDefault ? (
                    <View style={styles.mainPill}>
                      <Text style={styles.mainPillText}>PRINCIPAL</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardNumber}>•••• {card.last4}</Text>
              </View>

              <TouchableOpacity style={styles.iconButton} onPress={() => goToEditCard(card)}>
                <Ionicons name="pencil" size={15} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => handleDelete(card)}
              >
                <Ionicons name="trash" size={15} color={colors.maroon} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>TITULAR</Text>
                <Text style={styles.footerValue}>{card.holder}</Text>
              </View>
              <View>
                <Text style={[styles.footerLabel, styles.textRight]}>EXPIRA</Text>
                <Text style={[styles.footerValue, styles.textRight]}>{card.expiry}</Text>
              </View>
            </View>

            {!card.isDefault ? (
              <TouchableOpacity
                style={styles.makeDefault}
                onPress={() => setDefaultCard(card)}
                activeOpacity={0.7}
              >
                <Ionicons name="star-outline" size={13} color={colors.primary} />
                <Text style={styles.makeDefaultText}>Usar como principal</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={goToAddCard} activeOpacity={0.85}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={18} color={colors.white} />
          </View>
          <Text style={styles.addButtonText}>Agregar nueva tarjeta</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoTexts}>
            <Text style={styles.infoTitle}>Qué se guarda y qué no</Text>
            <Text style={styles.infoText}>
              De cada tarjeta se guardan únicamente la marca, los últimos 4 dígitos, el titular y el
              vencimiento, y solo en este teléfono. El número completo y el CVV no se almacenan ni se
              envían a ningún servidor.
            </Text>
          </View>
        </View>
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
    headerLogo: { width: 24, height: 24 },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 14 },
    title: { flex: 1, fontFamily: SERIF, fontSize: 25, fontWeight: '700', color: colors.text },
    walletPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    walletPillText: {
      fontSize: 9,
      letterSpacing: 0.8,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 5,
    },

    banner: {
      backgroundColor: isDark ? '#17301F' : colors.primary,
      borderRadius: 20,
      padding: 20,
    },
    bannerTop: { flexDirection: 'row', alignItems: 'center' },
    bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E4D7A8', marginRight: 8 },
    bannerEyebrow: {
      flex: 1,
      fontSize: 9.5,
      letterSpacing: 1.6,
      fontWeight: '700',
      color: '#E4D7A8',
    },
    bannerTitle: {
      fontFamily: SERIF,
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
      marginTop: 16,
    },
    bannerText: {
      fontSize: 12.5,
      lineHeight: 18,
      color: 'rgba(255,255,255,0.78)',
      marginTop: 8,
    },

    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: 12,
    },
    sectionTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    countPill: {
      backgroundColor: isDark ? colors.card : '#F2F4F2',
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    countPillText: { fontSize: 9.5, letterSpacing: 0.8, fontWeight: '700', color: colors.placeholder },

    loader: { marginVertical: 20 },
    emptyCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 22,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? colors.border : '#DCE2DD',
    },
    emptyText: {
      fontSize: 12.5,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 10,
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardTitles: { flex: 1 },
    cardNameRow: { flexDirection: 'row', alignItems: 'center' },
    cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 },
    mainPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    mainPillText: { fontSize: 8.5, letterSpacing: 0.6, fontWeight: '700', color: colors.primary },
    cardNumber: { fontSize: 12.5, color: colors.placeholder, marginTop: 3 },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    deleteButton: { backgroundColor: isDark ? '#2F1F1D' : '#F8E2E2' },

    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerLabel: { fontSize: 9, letterSpacing: 1, fontWeight: '700', color: colors.placeholder },
    footerValue: { fontSize: 13.5, fontWeight: '700', color: colors.text, marginTop: 3 },
    textRight: { textAlign: 'right' },

    makeDefault: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    makeDefaultText: { fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 6 },

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    addIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    addButtonText: { fontSize: 14.5, fontWeight: '700', color: colors.text },

    infoBox: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.card : '#F2F4F2',
      borderRadius: 18,
      padding: 16,
      marginTop: 20,
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTexts: { flex: 1, marginLeft: 12 },
    infoTitle: { fontSize: 13.5, fontWeight: '700', color: colors.text },
    infoText: { fontSize: 12, lineHeight: 17.5, color: colors.placeholder, marginTop: 5 },
  });
