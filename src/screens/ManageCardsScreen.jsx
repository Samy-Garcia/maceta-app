import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useManageCards } from '../hooks/useManageCards.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ManageCardsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { user } = useAuth();
  const { card, goToAddCard, handleDelete } = useManageCards(navigation);
  const fallbackHolder = [user?.name, user?.lastName].filter(Boolean).join(' ');

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
          <Text style={styles.title}>Método de pago</Text>
          <View style={styles.walletPill}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.primary} />
            <Text style={styles.walletPillText}>TOKENIZADA CON WOMPI</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerTop}>
            <View style={styles.bannerDot} />
            <Text style={styles.bannerEyebrow}>TU TARJETA</Text>
            <Ionicons name="card-outline" size={20} color="#E4D7A8" />
          </View>
          <Text style={styles.bannerTitle}>Paga más rápido</Text>
          <Text style={styles.bannerText}>
            Se guarda ligada a tu cuenta (no a este teléfono), tokenizada con Wompi. Nunca se guarda el
            número completo ni el CVV. Solo puedes tener una tarjeta a la vez.
          </Text>
        </View>

        {card ? (
          <LinearGradient
            colors={isDark ? ['#17301F', '#0E1F14'] : [colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            <View style={styles.cardPreviewTop}>
              <View style={styles.cardPreviewTopLeft}>
                <View style={styles.chip} />
                <Ionicons name="wifi" size={16} color="rgba(255,255,255,0.7)" style={styles.contactless} />
              </View>
              <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardPreviewNumber}>{card.maskedNumber || '•••• •••• •••• ••••'}</Text>
            <View style={styles.cardPreviewBottom}>
              <View style={styles.cardPreviewCol}>
                <Text style={styles.cardPreviewLabel}>TITULAR</Text>
                <Text style={styles.cardPreviewValue} numberOfLines={1}>
                  {(card.cardHolderName || fallbackHolder || '').toUpperCase()}
                </Text>
              </View>
              {card.expMonth && card.expYear ? (
                <View>
                  <Text style={[styles.cardPreviewLabel, styles.textRight]}>EXPIRA</Text>
                  <Text style={[styles.cardPreviewValue, styles.textRight]}>
                    {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                  </Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="card-outline" size={24} color={colors.placeholder} />
            <Text style={styles.emptyText}>Todavía no tienes ninguna tarjeta guardada.</Text>
          </View>
        )}

        {!card ? (
          <TouchableOpacity style={styles.addButton} onPress={goToAddCard} activeOpacity={0.85}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={18} color={colors.white} />
            </View>
            <Text style={styles.addButtonText}>Agregar tarjeta</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.replaceHint}>
            Para cambiarla, elimina la tarjeta actual y agrega la nueva.
          </Text>
        )}

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoTexts}>
            <Text style={styles.infoTitle}>Qué se guarda y qué no</Text>
            <Text style={styles.infoText}>
              De tu tarjeta se guardan únicamente los últimos dígitos, el titular y el vencimiento,
              ligados a tu cuenta. El número completo y el CVV no se almacenan ni se envían a ningún
              servidor fuera de Wompi.
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
      fontSize: 8.5,
      letterSpacing: 0.6,
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

    emptyCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 22,
      marginTop: 20,
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

    cardPreview: { borderRadius: 20, padding: 20, marginTop: 20 },
    cardPreviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardPreviewTopLeft: { flexDirection: 'row', alignItems: 'center' },
    chip: { width: 34, height: 26, borderRadius: 6, backgroundColor: '#D9BE7E' },
    contactless: { marginLeft: 10, transform: [{ rotate: '90deg' }] },
    cardPreviewNumber: {
      fontSize: 19,
      letterSpacing: 2,
      fontWeight: '700',
      color: colors.white,
      marginTop: 22,
    },
    cardPreviewBottom: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 14 },
    cardPreviewCol: { flex: 1, marginRight: 16 },
    cardPreviewLabel: {
      fontSize: 8.5,
      letterSpacing: 1.2,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.6)',
    },
    cardPreviewValue: { fontSize: 13.5, fontWeight: '700', color: colors.white, marginTop: 4 },
    textRight: { textAlign: 'right' },

    replaceHint: {
      fontSize: 11.5,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 14,
    },

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 20,
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
