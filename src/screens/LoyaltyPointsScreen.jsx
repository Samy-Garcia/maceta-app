import { useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import CopyableCode from '../components/CopyableCode.jsx';
import { daysUntilBirthday, formatBirthDay, readBirthDate } from '../utils/birthDate.js';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.jsx';
import { tierIcon } from '../utils/loyaltyTiers.js';
import { useToast } from '../context/ToastContext.jsx';

// Tonos de marca que no dependen del tema (van sobre el verde oscuro de la tarjeta)
const GOLD = '#F3D89B';
const GOLD_STRONG = '#E9C877';
const ON_DARK = '#FFFFFF';
const ON_DARK_SOFT = 'rgba(255,255,255,0.72)';

const BIRTHDAY_COPY = {
  'no-date': 'Agrega tu fecha de nacimiento en tu perfil para activar tu bono de cumpleaños.',
  waiting: 'Tu bono de 100 hojas se activa automáticamente el día de tu cumpleaños.',
  available: '¡Hoy es tu cumpleaños! Reclama tus 100 hojas de regalo.',
  claimed: 'Ya reclamaste tu bono de cumpleaños este año. ¡Nos vemos el próximo!',
};

// Cómo se ganan hojas. Estas son las reglas REALES que aplica el backend;
// si cambian allá, hay que actualizarlas aquí:
//   cartController.js   → grantPoints(clientId, Math.floor(finalTotal))  = 1 hoja por $1
//   cartController.js   → grantPoints(referredBy, 200) en la 1ª compra del referido
//   reviewController.js → grantPoints(clientId, 25) al publicar una reseña
//   loyaltyController.js → claimBirthday otorga 100
const EARN_RULES = [
  { id: 'compras', icon: 'bag-outline', title: 'Compras en tienda', description: 'Por cada $1 USD del total de tu pedido', reward: '+1 Hoja', tone: 'green' },
  { id: 'resena', icon: 'star-outline', title: 'Reseña de producto', description: 'Al reseñar un producto que compraste', reward: '+25 Hojas', tone: 'green' },
  { id: 'cumple', icon: 'gift-outline', title: 'Cumpleaños botánico', description: 'El día de tu cumpleaños, una vez al año', reward: '+100 Hojas', tone: 'gold' },
  { id: 'referido', icon: 'people-outline', title: 'Recomendar un amigo', description: 'Cuando tu referido haga su primera compra', reward: '+200 Hojas', tone: 'green' },
];

export default function LoyaltyPointsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const toast = useToast();
  const { user } = useAuth();
  const birthDate = readBirthDate(user);
  const daysToBirthday = daysUntilBirthday(birthDate);
  const {
    loyalty, rewards, offers, redemptions, tier, tiers, usdValue, loading, error, retry,
    claiming, handleClaimBirthday, redeemingId, handleRedeem,
  } = useLoyalty();

  // Solo los canjes con código son "cupones" (los productos se entregan físicos)
  const coupons = redemptions.filter((item) => item.code);

  const scrollRef = useRef(null);
  const positions = useRef({});

  // Nombre de quien inició sesión en esta cuenta (mismo dato que usa el perfil)
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || '';

  const scrollToSection = (key) => {
    const y = positions.current[key];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
  };

  const trackSection = (key) => (event) => {
    positions.current[key] = event.nativeEvent.layout.y;
  };

  const showTierBenefits = () => {
    const lines = tiers
      .map((t) => `• Nivel ${t.key} — desde ${t.min.toLocaleString('es')} hojas`)
      .join('\n');
    toast.alert({
      title: 'Beneficios por nivel',
      message: `${lines}\n\nGanas 1 hoja por cada $1 de tus pedidos, así que subes de nivel comprando en la tienda.`,
      icon: 'ribbon',
      confirmLabel: 'Entendido',
    });
  };

  const QUICK_ACTIONS = [
    { key: 'ganar', label: 'Ganar puntos', icon: 'add', target: 'earn' },
    { key: 'canjear', label: 'Canjear', icon: 'gift', screen: 'RedeemRewards' },
    { key: 'historial', label: 'Historial', icon: 'time', target: 'history' },
    { key: 'cupones', label: 'Cupones', icon: 'ticket', target: 'bonuses' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Macetas Rewards</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} hitSlop={10}>
          <Ionicons name="person-circle-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? <Text style={styles.stateText}>Cargando tu programa de lealtad...</Text> : null}
      {error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity onPress={retry}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : null}

      {loyalty ? (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>MACETAS REWARDS</Text>
          <Text style={styles.greeting}>{firstName ? `¡Hola, ${firstName}!` : '¡Hola!'}</Text>
          <Text style={styles.greetingSub}>Tu jardín está creciendo con cada elección.</Text>

          {/* Tarjeta principal: hojas acumuladas, nivel y progreso */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.tierBadge}>
                <Ionicons name={tierIcon(tier.current.key)} size={13} color={colors.primaryDark} />
                <Text style={styles.tierBadgeText}>Nivel {tier.current.key}</Text>
              </View>
              <TouchableOpacity style={styles.heroLink} onPress={showTierBenefits}>
                <Text style={styles.heroLinkText}>Beneficios</Text>
                <Ionicons name="chevron-forward" size={13} color={ON_DARK} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroPointsRow}>
              <View>
                <Text style={styles.heroLabel}>HOJAS ACUMULADAS</Text>
                <View style={styles.heroValueRow}>
                  <Text style={styles.heroValue}>{loyalty.points.toLocaleString('es')}</Text>
                  <Ionicons name="leaf" size={24} color={GOLD_STRONG} style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View style={styles.usdChip}>
                <Text style={styles.usdChipText}>≈ ${usdValue} USD</Text>
              </View>
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Nivel {tier.current.key}</Text>
              <Text style={styles.progressLabel}>
                {tier.next ? `Nivel ${tier.next.key} (${tier.next.min.toLocaleString('es')})` : 'Nivel máximo'}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(tier.progress * 100)}%` }]} />
            </View>
            <View style={styles.progressHintRow}>
              <Ionicons name="flash" size={12} color={GOLD_STRONG} />
              <Text style={styles.progressHint}>
                {tier.next
                  ? `Te faltan ${tier.remaining.toLocaleString('es')} puntos para alcanzar el nivel ${tier.next.key}`
                  : 'Alcanzaste el nivel más alto del programa. ¡Felicidades!'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.heroButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RedeemRewards')}
            >
              <Ionicons name="gift" size={16} color={colors.primaryDark} />
              <Text style={styles.heroButtonText}>Canjear recompensas</Text>
            </TouchableOpacity>
          </View>

          {/* Accesos rápidos */}
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickItem}
                activeOpacity={0.7}
                onPress={() =>
                  action.screen ? navigation.navigate(action.screen) : scrollToSection(action.target)
                }
              >
                <View style={styles.quickIcon}>
                  <Ionicons name={action.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ofertas activas: descuentos reales del catálogo (GET /api/offers,
              solo los que tienen status = true). No son multiplicadores de
              hojas: el backend no maneja ese concepto. */}
          {offers.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Ofertas activas</Text>
                  <Text style={styles.sectionSub}>Descuentos vigentes en la tienda</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersRow}
              >
                {offers.map((offer) => (
                  <TouchableOpacity
                    key={offer._id}
                    style={styles.offerCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Products')}
                  >
                    <View style={styles.offerTagRow}>
                      <View style={styles.offerTag}>
                        <Text style={styles.offerTagText}>-{offer.discountPercentage}%</Text>
                      </View>
                      <Ionicons name="star" size={15} color={GOLD_STRONG} />
                    </View>
                    {offer.product?.image ? (
                      <Image source={{ uri: offer.product.image }} style={styles.offerImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.offerImage, styles.offerImageFallback]}>
                        <Ionicons name="leaf-outline" size={24} color={colors.placeholder} />
                      </View>
                    )}
                    <Text style={styles.offerTitle} numberOfLines={1}>{offer.product?.name}</Text>
                    <Text style={styles.offerDescription} numberOfLines={2}>
                      {offer.discountPercentage}% de descuento en este producto.
                    </Text>
                    <View style={styles.offerFooterRow}>
                      <Text style={styles.offerOldPrice}>$ {offer.product?.price?.toFixed(2)}</Text>
                      <Text style={styles.offerNewPrice}>$ {offer.discountedPrice?.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}

          {/* Cómo ganar hojas */}
          <View onLayout={trackSection('earn')}>
            <Text style={styles.sectionTitle}>Cómo ganar Hojas</Text>
            <Text style={styles.sectionSub}>Cultiva recompensas con cada acción</Text>
            <View style={{ marginTop: 12 }}>
              {EARN_RULES.map((rule) => (
                <View key={rule.id} style={styles.earnCard}>
                  <View style={styles.earnIcon}>
                    <Ionicons name={rule.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.earnText}>
                    <Text style={styles.earnTitle}>{rule.title}</Text>
                    <Text style={styles.earnDescription}>{rule.description}</Text>
                  </View>
                  <View style={[styles.earnBadge, rule.tone === 'gold' && styles.earnBadgeGold]}>
                    <Text style={[styles.earnBadgeText, rule.tone === 'gold' && styles.earnBadgeTextGold]}>
                      {rule.reward}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Cupones y bonos: canjes reales + referido + cumpleaños */}
          <View onLayout={trackSection('bonuses')}>
            <Text style={styles.sectionTitle}>Cupones y bonos</Text>

            {/* Canjes reales (GET /api/loyalty/redemptions). Los de tipo
                coupon/shipping traen el código que se usa al pagar. */}
            {coupons.length > 0 ? (
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="ticket-outline" size={16} color={colors.primary} />
                  <Text style={styles.cardTitle}>Mis cupones canjeados</Text>
                </View>
                {coupons.map((item) => {
                  const used = item.status === 'used';
                  return (
                    <View key={item._id} style={styles.couponRow}>
                      <View style={styles.couponTextWrap}>
                        <Text style={styles.couponTitle}>{item.title}</Text>
                        <Text style={styles.couponCode}>{item.code}</Text>
                      </View>
                      <View style={[styles.couponStatus, used && styles.couponStatusUsed]}>
                        <Text style={[styles.couponStatusText, used && styles.couponStatusTextUsed]}>
                          {used ? 'Usado' : 'Disponible'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <Text style={styles.cardHint}>
                  Selecciona tu cupón al confirmar el pedido para aplicar el beneficio.
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tu código de referido</Text>
              <CopyableCode
                code={loyalty.referralCode}
                label='Código de referido copiado'
                hint='Toca para copiarlo y compartirlo'
              />
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

              {birthDate ? (
                <View style={styles.birthdayRow}>
                  <Ionicons name="calendar" size={15} color={colors.primary} />
                  <View style={styles.birthdayTexts}>
                    <Text style={styles.birthdayDate}>{formatBirthDay(birthDate)}</Text>
                    {daysToBirthday === 0 ? (
                      <Text style={styles.birthdayNote}>¡Es hoy!</Text>
                    ) : daysToBirthday != null ? (
                      <Text style={styles.birthdayNote}>
                        {daysToBirthday === 1
                          ? 'Falta 1 día'
                          : 'Faltan ' + daysToBirthday + ' días'}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditProfile')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="pencil" size={14} color={colors.placeholder} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addBirthdayButton}
                  onPress={() => navigation.navigate('EditProfile')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.white} />
                  <Text style={styles.addBirthdayText}>Agregar fecha de cumpleaños</Text>
                </TouchableOpacity>
              )}

              {loyalty.birthdayStatus === 'available' ? (
                <View style={{ marginTop: 12 }}>
                  <Button label="Reclamar 100 hojas" onPress={handleClaimBirthday} loading={claiming} />
                </View>
              ) : null}
            </View>
          </View>

          {/* Recompensas canjeables */}
          <View onLayout={trackSection('rewards')}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recompensas disponibles</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RedeemRewards')} style={{ marginTop: 26 }}>
                <Text style={styles.seeAllLink}>Ver catálogo ›</Text>
              </TouchableOpacity>
            </View>
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
          </View>

          {/* Historial de movimientos */}
          <View onLayout={trackSection('history')}>
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
          </View>
        </ScrollView>
      ) : null}

      <BottomTabBar active="Perfil" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    topBar: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    topBarTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 16 },
    stateBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
    content: { padding: 20, paddingBottom: 28 },

    eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: colors.primary },
    greeting: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 6 },
    greetingSub: { fontSize: 13, color: colors.placeholder, marginTop: 4 },

    heroCard: {
      backgroundColor: colors.primaryDark,
      borderRadius: 20,
      padding: 20,
      marginTop: 18,
    },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tierBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: GOLD,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tierBadgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12, marginLeft: 6 },
    heroLink: { flexDirection: 'row', alignItems: 'center' },
    heroLinkText: { color: ON_DARK, fontWeight: '700', fontSize: 13, marginRight: 2 },

    heroPointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18 },
    heroLabel: { color: ON_DARK_SOFT, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    heroValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    heroValue: { color: ON_DARK, fontSize: 34, fontWeight: '800' },
    usdChip: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
    usdChipText: { color: ON_DARK, fontSize: 12, fontWeight: '700' },

    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    progressLabel: { color: ON_DARK_SOFT, fontSize: 11, fontWeight: '600' },
    progressTrack: {
      height: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.18)',
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 6, backgroundColor: GOLD_STRONG },
    progressHintRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    progressHint: { color: ON_DARK_SOFT, fontSize: 11, marginLeft: 6, flex: 1, lineHeight: 15 },
    heroButton: {
      marginTop: 18,
      backgroundColor: GOLD,
      borderRadius: 12,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroButtonText: { color: colors.primaryDark, fontSize: 15, fontWeight: '800', marginLeft: 8 },

    quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    quickItem: { alignItems: 'center', width: '23%' },
    quickIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickLabel: { fontSize: 11, color: colors.text, marginTop: 6, textAlign: 'center' },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 26 },
    sectionSub: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
    seeAllLink: { fontSize: 12, color: colors.maroon, fontWeight: '700' },

    offersRow: { paddingVertical: 14, paddingRight: 8 },
    offerCard: {
      width: 240,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      marginRight: 14,
    },
    offerTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    offerTag: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    offerTagText: { color: colors.white, fontSize: 10, fontWeight: '700' },
    offerImage: { width: '100%', height: 110, borderRadius: 12, backgroundColor: colors.border },
    offerTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 12 },
    offerDescription: { fontSize: 12, color: colors.placeholder, marginTop: 4, lineHeight: 17 },
    offerImageFallback: { alignItems: 'center', justifyContent: 'center' },
    offerFooterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    offerOldPrice: {
      fontSize: 12,
      color: colors.placeholder,
      textDecorationLine: 'line-through',
      marginRight: 8,
    },
    offerNewPrice: { fontSize: 15, fontWeight: '800', color: colors.primary },

    earnCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
    },
    earnIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    earnText: { flex: 1, marginRight: 10 },
    earnTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    earnDescription: { fontSize: 11, color: colors.placeholder, marginTop: 2, lineHeight: 15 },
    earnBadge: { backgroundColor: '#D9F0DF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
    earnBadgeGold: { backgroundColor: '#F7E4B0' },
    earnBadgeText: { fontSize: 12, fontWeight: '800', color: '#1B7A3D' },
    earnBadgeTextGold: { color: '#8A6D1F' },

    birthdayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 10,
    },
    birthdayTexts: { flex: 1, marginLeft: 10 },
    birthdayDate: { fontSize: 14, fontWeight: '800', color: colors.primary },
    birthdayNote: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    addBirthdayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: 23,
      marginTop: 12,
      backgroundColor: colors.primary,
    },
    addBirthdayText: { fontSize: 13.5, fontWeight: '700', color: colors.white, marginLeft: 8 },
    card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 12 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    couponRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
    },
    couponTextWrap: { flex: 1, marginRight: 10 },
    couponTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
    couponCode: { fontSize: 14, fontWeight: '800', color: colors.primary, letterSpacing: 1, marginTop: 2 },
    couponStatus: { backgroundColor: '#D9F0DF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    couponStatusUsed: { backgroundColor: colors.border },
    couponStatusText: { fontSize: 11, fontWeight: '800', color: '#1B7A3D' },
    couponStatusTextUsed: { color: colors.placeholder },
    cardHint: { fontSize: 12, color: colors.placeholder, marginTop: 8, lineHeight: 17 },

    rewardCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14,
      padding: 14, marginTop: 12,
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
