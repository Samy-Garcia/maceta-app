import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Logo from '../components/Logo.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Tonos de marca fijos (van sobre el verde oscuro de la tarjeta)
const GOLD = '#F3D89B';
const GOLD_STRONG = '#E9C877';
const ON_DARK = '#FFFFFF';
const ON_DARK_SOFT = 'rgba(255,255,255,0.72)';

// GET /api/loyalty/rewards ya devuelve "type" ('product' | 'coupon' | 'shipping'),
// "category" (el nombre que se muestra en el panel de administración) y la URL de
// "image" en Cloudinary, así que nada de esto se adivina en la app.
const TYPE_META = {
  coupon: { label: 'Cupones', icon: 'ticket-outline', tag: 'Cupón' },
  shipping: { label: 'Envíos', icon: 'cube-outline', tag: 'Logística' },
  product: { label: 'Productos', icon: 'leaf-outline', tag: 'VIP' },
};

const ALL_FILTER = { key: 'all', label: 'Todos', icon: 'pricetag-outline' };

// La etiqueta sobre la imagen: los productos solo se marcan "VIP" cuando son caros
function tagFor(reward) {
  if (reward.type === 'product') return reward.cost >= 1000 ? 'VIP' : null;
  return TYPE_META[reward.type]?.tag ?? null;
}

export default function RedeemRewardsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const toast = useToast();
  const { loyalty, rewards, tier, loading, error, retry, redeemingId, handleRedeem } = useLoyalty();
  const [filter, setFilter] = useState('all');

  const catalog = rewards || [];

  // Las pestañas salen de los tipos que realmente trae el catálogo
  const filters = useMemo(() => {
    const types = [...new Set(catalog.map((r) => r.type).filter(Boolean))];
    return [
      ALL_FILTER,
      ...types.map((t) => ({
        key: t,
        label: TYPE_META[t]?.label ?? t,
        icon: TYPE_META[t]?.icon ?? 'pricetag-outline',
      })),
    ];
  }, [catalog]);

  const visible = filter === 'all' ? catalog : catalog.filter((r) => r.type === filter);

  const showHelp = () =>
    toast.alert({
      title: '¿Cómo canjeo mis Hojas?',
      message:
        'Elige una recompensa con hojas suficientes y toca "Canjear". Los cupones te dan un código para usar al confirmar tu pedido; los productos se agregan a tu próximo envío.',
      icon: 'help-circle',
      confirmLabel: 'Entendido',
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <Logo size={26} />
          <Text style={styles.brandName}>Macetas 503</Text>
        </View>
        <View style={styles.brandRight}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')} hitSlop={8}>
            <Ionicons name="person" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleBar}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Canjear Recompensas</Text>
        <TouchableOpacity style={styles.circleBtn} onPress={showHelp} hitSlop={8}>
          <Ionicons name="help" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? <Text style={styles.stateText}>Cargando el catálogo...</Text> : null}
      {error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity onPress={retry}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : null}

      {loyalty ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tarjeta de saldo */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTopRow}>
              <View style={styles.clubBadge}>
                <Ionicons name="leaf" size={13} color={colors.primaryDark} />
                <Text style={styles.clubBadgeText}>Club Botánico</Text>
              </View>
              <Text style={styles.tierText}>NIVEL {tier.current.key.toUpperCase()}</Text>
            </View>

            <Text style={styles.balanceLabel}>TUS HOJAS DISPONIBLES</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceValue}>{loyalty.points.toLocaleString('es')}</Text>
              <Ionicons name="leaf" size={22} color={GOLD_STRONG} style={{ marginLeft: 8 }} />
            </View>

            <TouchableOpacity
              style={styles.historyRow}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('LoyaltyPoints')}
            >
              <Ionicons name="time-outline" size={16} color={ON_DARK_SOFT} />
              <Text style={styles.historyText}>Revisa tus últimos canjes</Text>
              <Text style={styles.historyLink}>Ver Historial</Text>
              <Ionicons name="chevron-forward" size={13} color={GOLD_STRONG} />
            </TouchableOpacity>
          </View>

          {/* Filtros (son 4 con el catálogo actual, así que se desplazan) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((f) => {
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={f.icon} size={14} color={active ? colors.white : colors.text} />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Catálogo */}
          <View style={styles.catalogHeader}>
            <Text style={styles.catalogTitle}>Catálogo Exclusivo</Text>
            <Text style={styles.catalogCount}>{visible.length} disponibles</Text>
          </View>

          {visible.length === 0 ? (
            <Text style={styles.stateText}>No hay recompensas en esta categoría por ahora.</Text>
          ) : null}

          <View style={styles.grid}>
            {visible.map((reward) => {
              const affordable = loyalty.points >= reward.cost;
              const disabled = reward.redeemed || !affordable || redeemingId === reward.id;
              const tag = tagFor(reward);
              const isVip = tag === 'VIP';
              return (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={styles.rewardImageWrap}>
                    {reward.image ? (
                      <Image source={{ uri: reward.image }} style={styles.rewardImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.rewardImage, styles.rewardImageFallback]}>
                        <Ionicons name="leaf-outline" size={24} color={colors.placeholder} />
                      </View>
                    )}
                    {tag ? (
                      <View style={[styles.rewardTag, isVip && styles.rewardTagVip]}>
                        {isVip ? (
                          <Ionicons name="star" size={10} color={colors.primaryDark} style={{ marginRight: 3 }} />
                        ) : null}
                        <Text style={[styles.rewardTagText, isVip && styles.rewardTagTextVip]}>
                          {tag}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.rewardTitle} numberOfLines={2}>{reward.title}</Text>
                  {reward.description ? (
                    <Text style={styles.rewardDescription} numberOfLines={2}>{reward.description}</Text>
                  ) : null}

                  <View style={styles.rewardCostRow}>
                    <Ionicons name="leaf" size={14} color={colors.primary} />
                    <Text style={styles.rewardCost}>{reward.cost.toLocaleString('es')} Hojas</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.redeemButton, disabled && styles.redeemButtonDisabled]}
                    onPress={() => handleRedeem(reward)}
                    disabled={disabled}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.redeemButtonText}>
                      {reward.redeemed
                        ? 'Canjeada'
                        : redeemingId === reward.id
                          ? 'Canjeando...'
                          : affordable
                            ? 'Canjear'
                            : 'Hojas insuficientes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="sparkles" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>¡Próximamente más sorpresas!</Text>
              <Text style={styles.bannerSub}>Nuevos esquejes raros y macetas de edición</Text>
            </View>
            <Ionicons name="notifications-outline" size={18} color={colors.placeholder} />
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

    brandBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 10,
      backgroundColor: colors.surface,
    },
    brandLeft: { flexDirection: 'row', alignItems: 'center' },
    brandName: { fontSize: 18, fontWeight: '800', color: colors.primary, marginLeft: 8 },
    brandRight: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 14,
    },

    titleBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.surface,
    },
    circleBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.shopBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: { fontSize: 19, fontWeight: '800', color: colors.text },

    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 16 },
    stateBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },

    content: { padding: 20, paddingBottom: 28 },

    balanceCard: { backgroundColor: colors.primaryDark, borderRadius: 20, padding: 20 },
    balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clubBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: GOLD,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    clubBadgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12, marginLeft: 6 },
    tierText: { color: ON_DARK_SOFT, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    balanceLabel: { color: ON_DARK_SOFT, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 18 },
    balanceValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    balanceValue: { color: ON_DARK, fontSize: 40, fontWeight: '800' },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 18,
    },
    historyText: { color: ON_DARK, fontSize: 12, flex: 1, marginLeft: 8 },
    historyLink: { color: GOLD_STRONG, fontSize: 13, fontWeight: '800', marginRight: 2 },

    filterRow: { flexDirection: 'row', marginTop: 20, paddingRight: 8 },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 10,
    },
    filterPillActive: { backgroundColor: colors.primaryDark },
    filterText: { fontSize: 13, fontWeight: '700', color: colors.text, marginLeft: 6 },
    filterTextActive: { color: colors.white },

    catalogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 },
    catalogTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
    catalogCount: { fontSize: 12, color: colors.placeholder },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
    rewardCard: { width: '48%', backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 16 },
    rewardImageWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: colors.border },
    rewardImage: { width: '100%', height: 120 },
    rewardImageFallback: { alignItems: 'center', justifyContent: 'center' },
    rewardTag: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    rewardTagVip: { backgroundColor: GOLD },
    rewardTagText: { fontSize: 10, fontWeight: '800', color: colors.text },
    rewardTagTextVip: { color: colors.primaryDark },
    rewardTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 10 },
    rewardDescription: { fontSize: 11, color: colors.placeholder, marginTop: 4, lineHeight: 15 },
    rewardCostRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    rewardCost: { fontSize: 13, fontWeight: '800', color: colors.primary, marginLeft: 5 },
    redeemButton: {
      backgroundColor: colors.primaryDark,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
      marginTop: 12,
    },
    redeemButtonDisabled: { backgroundColor: colors.border },
    redeemButtonText: { color: colors.white, fontWeight: '800', fontSize: 12 },

    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
    },
    bannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: GOLD,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    bannerSub: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
  });
