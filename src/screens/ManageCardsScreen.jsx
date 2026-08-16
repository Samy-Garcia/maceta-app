import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useManageCards } from '../hooks/useManageCards.jsx';

export default function ManageCardsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { cards, loading, goToAddCard, goToEditCard, handleDelete } = useManageCards(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Ionicons name="card" size={32} color={colors.white} />
          <Text style={styles.bannerEyebrow}>BILLETERA DIGITAL</Text>
          <Text style={styles.bannerTitle}>Gestiona tus tarjetas</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tarjetas Guardadas</Text>
          <Text style={styles.sectionCount}>
            {cards.length} {cards.length === 1 ? 'Tarjeta' : 'Tarjetas'}
          </Text>
        </View>

        {!loading && cards.length === 0 ? (
          <Text style={styles.emptyText}>No tienes tarjetas guardadas todavía.</Text>
        ) : null}

        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Ionicons name="card" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardTitleWrapper}>
                <Text style={styles.cardLabel}>{card.label}</Text>
                <Text style={styles.cardNumber}>**** {card.last4}</Text>
              </View>
              <TouchableOpacity style={styles.iconButton} onPress={() => goToEditCard(card)}>
                <Ionicons name="pencil" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => handleDelete(card)}
              >
                <Ionicons name="trash" size={16} color={colors.maroonDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>Titular</Text>
                <Text style={styles.footerValue}>{card.holder}</Text>
              </View>
              <View>
                <Text style={[styles.footerLabel, styles.footerRight]}>Expira</Text>
                <Text style={[styles.footerValue, styles.footerRight]}>{card.expiry}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={goToAddCard}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={18} color={colors.primary} />
          </View>
          <Text style={styles.addButtonText}>Agregar nueva tarjeta</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Otros Métodos</Text>
        <View style={styles.otherMethods}>
          <View style={styles.otherMethodCard}>
            <Ionicons name="logo-paypal" size={26} color="#003087" />
            <Text style={styles.otherMethodText}>PayPal</Text>
          </View>
          <View style={styles.otherMethodCard}>
            <Ionicons name="logo-apple" size={26} color={colors.text} />
            <Text style={styles.otherMethodText}>Apple Pay</Text>
          </View>
        </View>

        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <View style={styles.securityTextWrapper}>
            <Text style={styles.securityTitle}>Seguridad de Nivel Bancario</Text>
            <Text style={styles.securitySubtitle}>
              Tus datos de pago están encriptados y protegidos bajo los estándares de seguridad más altos de la
              industria.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar active="Perfil" />
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
    content: { padding: 20, paddingBottom: 24 },
    banner: {
      backgroundColor: colors.primaryDark,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    bannerEyebrow: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', marginTop: 12, letterSpacing: 1 },
    bannerTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 8, marginBottom: 12 },
    sectionCount: { fontSize: 12, color: colors.placeholder },
    emptyText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginBottom: 14 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: {
      width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    cardTitleWrapper: { flex: 1 },
    cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    cardNumber: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
    iconButton: {
      width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginLeft: 8,
    },
    deleteButton: { backgroundColor: 'rgba(110, 27, 43, 0.12)' },
    cardFooter: {
      flexDirection: 'row', justifyContent: 'space-between', marginTop: 14,
      paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border,
    },
    footerLabel: { fontSize: 11, color: colors.placeholder },
    footerValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
    footerRight: { textAlign: 'right' },
    addButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed',
      borderRadius: 14, paddingVertical: 16, marginBottom: 24,
    },
    addIcon: {
      width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginRight: 8,
    },
    addButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
    otherMethods: { flexDirection: 'row', marginBottom: 20 },
    otherMethodCard: {
      flex: 1, backgroundColor: colors.primarySoft, borderRadius: 14, paddingVertical: 20,
      alignItems: 'center', marginHorizontal: 4,
    },
    otherMethodText: { fontSize: 13, color: colors.text, fontWeight: '600', marginTop: 8 },
    securityBox: {
      flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: 14, padding: 16,
    },
    securityTextWrapper: { flex: 1, marginLeft: 12 },
    securityTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
    securitySubtitle: { fontSize: 12, color: colors.placeholder, marginTop: 4, lineHeight: 17 },
  });
