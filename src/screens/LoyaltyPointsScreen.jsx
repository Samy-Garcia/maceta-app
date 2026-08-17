import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.jsx';

const BIRTHDAY_COPY = {
  'no-date': 'Agrega tu fecha de nacimiento en tu perfil para activar tu bono de cumpleaños.',
  waiting: 'Tu bono de 100 hojas se activa automáticamente el día de tu cumpleaños.',
  available: '¡Hoy es tu cumpleaños! Reclama tus 100 hojas de regalo.',
  claimed: 'Ya reclamaste tu bono de cumpleaños este año. ¡Nos vemos el próximo!',
};

export default function LoyaltyPointsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { loyalty, rewards, loading, error, retry, claiming, handleClaimBirthday, redeemingId, handleRedeem } =
    useLoyalty();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Puntos de Lealtad</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? <Text style={styles.stateText}>Cargando tu programa de lealtad...</Text> : null}
      {error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity onPress={retry}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : null}

      {loyalty ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.pointsCard}>
            <Ionicons name="leaf" size={28} color={colors.white} />
            <Text style={styles.pointsValue}>{loyalty.points}</Text>
            <Text style={styles.pointsLabel}>hojas disponibles</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tu código de referido</Text>
            <View style={styles.referralRow}>
              <Text style={styles.referralCode}>{loyalty.referralCode}</Text>
            </View>
            <Text style={styles.cardHint}>
              Comparte este código: cuando un amigo lo use al registrarse, ganas 200 hojas en su primera compra.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="gift-outline" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>Bono de cumpleaños</Text>
            </View>
            <Text style={styles.cardHint}>{BIRTHDAY_COPY[loyalty.birthdayStatus]}</Text>
            {loyalty.birthdayStatus === 'available' ? (
              <Button label="Reclamar 100 hojas" onPress={handleClaimBirthday} loading={claiming} />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Recompensas disponibles</Text>
          {rewards.length === 0 ? (
            <Text style={styles.stateText}>No hay recompensas disponibles por ahora.</Text>
          ) : null}
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardTextWrapper}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                {reward.description ? <Text style={styles.rewardDescription}>{reward.description}</Text> : null}
                <Text style={styles.rewardCost}>{reward.cost} hojas</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  (reward.redeemed || loyalty.points < reward.cost) && styles.redeemButtonDisabled,
                ]}
                onPress={() => handleRedeem(reward)}
                disabled={reward.redeemed || loyalty.points < reward.cost || redeemingId === reward.id}
              >
                <Text style={styles.redeemButtonText}>
                  {reward.redeemed ? 'Canjeada' : redeemingId === reward.id ? 'Canjeando...' : 'Canjear'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Historial</Text>
          {(loyalty.history || []).length === 0 ? (
            <Text style={styles.stateText}>Todavía no tienes movimientos.</Text>
          ) : null}
          {(loyalty.history || []).map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyTextWrapper}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text style={[styles.historyAmount, item.amount < 0 && styles.historyAmountNegative]}>
                {item.amount > 0 ? '+' : ''}{item.amount}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

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
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 16 },
    stateBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
    content: { padding: 20, paddingBottom: 24 },
    pointsCard: {
      backgroundColor: colors.primary, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16,
    },
    pointsValue: { color: colors.white, fontSize: 36, fontWeight: '800', marginTop: 8 },
    pointsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginLeft: 4 },
    referralRow: {
      backgroundColor: colors.primarySoft, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8,
    },
    referralCode: { fontSize: 18, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
    cardHint: { fontSize: 12, color: colors.placeholder, marginTop: 8, lineHeight: 17 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 12 },
    rewardCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14,
      padding: 14, marginBottom: 12,
    },
    rewardTextWrapper: { flex: 1, marginRight: 10 },
    rewardTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
    rewardDescription: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    rewardCost: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4 },
    redeemButton: { backgroundColor: colors.maroon, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    redeemButtonDisabled: { backgroundColor: colors.border },
    redeemButtonText: { color: colors.white, fontWeight: '700', fontSize: 12 },
    historyRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    historyTextWrapper: { flex: 1 },
    historyTitle: { fontSize: 13, color: colors.text, fontWeight: '600' },
    historyDate: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    historyAmount: { fontSize: 14, fontWeight: '800', color: colors.primary },
    historyAmountNegative: { color: colors.maroonDark },
  });
