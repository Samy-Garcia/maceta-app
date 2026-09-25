import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useProfile } from '../hooks/useProfile.jsx';
import appConfig from '../../app.json';

export default function ProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    user, fullName, toggleTheme,
    defaultCard, cards, defaultAddress, addresses,
    activeOrders, loyaltyPoints, loggingOut,
    goToEditProfile, goToCards, goToAddCard, goToEditCard,
    goToAddresses, goToAddAddress, goToEditAddress,
    goToOrders, goToWishlist, goToLoyalty, goToSecurity, handleLogout,
  } = useProfile(navigation);

  const links = [
    {
      key: 'orders',
      icon: 'cube-outline',
      label: 'Mis pedidos',
      note: 'Ver historial y entregas',
      badge: activeOrders > 0 ? activeOrders + ' activos' : null,
      badgeStrong: true,
      onPress: goToOrders,
    },
    {
      key: 'wishlist',
      icon: 'heart-outline',
      label: 'Mi lista de deseos',
      note: 'Productos guardados',
      onPress: goToWishlist,
    },
    {
      key: 'loyalty',
      icon: 'leaf-outline',
      label: 'Puntos de lealtad',
      note: 'Tus hojas y recompensas',
      badge: loyaltyPoints != null ? loyaltyPoints.toLocaleString('es') + ' hojas' : null,
      onPress: goToLoyalty,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={goToEditProfile}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatarImage} />
            ) : (
              <Image
                source={require('../../assets/logo.png')}
                style={styles.avatarLogo}
                resizeMode="contain"
              />
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="leaf" size={12} color={colors.white} />
            </View>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          <TouchableOpacity style={styles.editButton} onPress={goToEditProfile} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={15} color={colors.text} />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHead}>
          <Ionicons name="card-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>Métodos de pago</Text>
          <TouchableOpacity onPress={goToAddCard} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.sectionAction}>+ AGREGAR</Text>
          </TouchableOpacity>
        </View>

        {defaultCard ? (
          <TouchableOpacity
            style={styles.creditCard}
            activeOpacity={0.9}
            onPress={() => goToEditCard(defaultCard)}
          >
            <View style={styles.creditTop}>
              <View style={styles.chip} />
              <Ionicons name="wifi" size={16} color="rgba(255,255,255,0.7)" style={styles.contactless} />
              <Text style={styles.creditBrand}>MACETAS 503</Text>
            </View>

            <Text style={styles.creditNumber}>••••  ••••  ••••  {defaultCard.last4}</Text>

            <View style={styles.creditBottom}>
              <View>
                <Text style={styles.creditLabel}>TITULAR</Text>
                <Text style={styles.creditValue} numberOfLines={1}>
                  {defaultCard.holder?.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.creditLabel}>VENCE</Text>
                <Text style={styles.creditValue}>{defaultCard.expiry}</Text>
              </View>
              <Text style={styles.creditType}>{defaultCard.label}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={goToAddCard} activeOpacity={0.8}>
            <Ionicons name="card-outline" size={20} color={colors.placeholder} />
            <Text style={styles.emptyText}>Agrega una tarjeta para pagar más rápido</Text>
          </TouchableOpacity>
        )}

        {cards.length > 1 ? (
          <TouchableOpacity style={styles.moreLink} onPress={goToCards}>
            <Text style={styles.moreLinkText}>
              Ver las {cards.length} tarjetas guardadas
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.placeholder} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHead}>
          <Ionicons name="location-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>Direcciones guardadas</Text>
          <TouchableOpacity onPress={goToAddAddress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.sectionAction}>+ AGREGAR</Text>
          </TouchableOpacity>
        </View>

        {defaultAddress ? (
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={styles.addressTexts}>
              <View style={styles.addressTop}>
                <Text style={styles.addressName} numberOfLines={1}>
                  {defaultAddress.fullName || 'Dirección principal'}
                </Text>
                {defaultAddress.isDefault ? (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultPillText}>PREDETERMINADA</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.addressLine}>
                {[defaultAddress.addressLine, defaultAddress.municipality, defaultAddress.department]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              {defaultAddress.phone ? (
                <View style={styles.addressPhoneRow}>
                  <Ionicons name="call-outline" size={12} color={colors.placeholder} />
                  <Text style={styles.addressPhone}>{defaultAddress.phone}</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => goToEditAddress(defaultAddress)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-vertical" size={17} color={colors.placeholder} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={goToAddAddress} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={20} color={colors.placeholder} />
            <Text style={styles.emptyText}>Marca tu dirección en el mapa para tus envíos</Text>
          </TouchableOpacity>
        )}

        {addresses.length > 1 ? (
          <TouchableOpacity style={styles.moreLink} onPress={goToAddresses}>
            <Text style={styles.moreLinkText}>
              Ver las {addresses.length} direcciones guardadas
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.placeholder} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHead}>
          <Ionicons name="options-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>Ajustes y actividad</Text>
        </View>

        <View style={styles.listCard}>
          {links.map((link, index) => (
            <TouchableOpacity
              key={link.key}
              style={[styles.row, index > 0 && styles.rowDivider]}
              onPress={link.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={link.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{link.label}</Text>
                <Text style={styles.rowNote}>{link.note}</Text>
              </View>
              {link.badge ? (
                <View style={[styles.badge, link.badgeStrong && styles.badgeStrong]}>
                  <Text style={[styles.badgeText, link.badgeStrong && styles.badgeTextStrong]}>
                    {link.badge}
                  </Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
            </TouchableOpacity>
          ))}

          <View style={[styles.row, styles.rowDivider]}>
            <View style={styles.rowIcon}>
              <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowLabel}>Tema</Text>
              <Text style={styles.rowNote}>{isDark ? 'Modo oscuro' : 'Modo claro'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.row, styles.rowDivider]}
            onPress={goToSecurity}
            activeOpacity={0.7}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowLabel}>Seguridad</Text>
              <Text style={styles.rowNote}>Cambiar tu contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.maroon} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.maroon} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>
          Macetas 503 · Atelier Botánico v{appConfig.expo.version}
        </Text>
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
    headerTitle: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: colors.text },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    avatarWrapper: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    avatarImage: { width: '100%', height: '100%', borderRadius: 44 },
    avatarLogo: { width: 52, height: 52 },
    avatarBadge: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    name: {
      fontFamily: SERIF,
      fontSize: 23,
      fontWeight: '700',
      color: colors.text,
      marginTop: 14,
      textAlign: 'center',
    },
    email: { fontSize: 13, color: colors.placeholder, marginTop: 4 },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      height: 40,
      paddingHorizontal: 18,
      borderRadius: 20,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    editButtonText: { fontSize: 13.5, fontWeight: '700', color: colors.text, marginLeft: 7 },

    sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
    sectionTitle: {
      flex: 1,
      fontFamily: SERIF,
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 8,
    },
    sectionAction: { fontSize: 11, letterSpacing: 0.6, fontWeight: '700', color: colors.maroon },

    creditCard: {
      borderRadius: 20,
      padding: 20,
      backgroundColor: isDark ? '#17301F' : colors.primary,
      shadowColor: '#0B2016',
      shadowOpacity: isDark ? 0 : 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    creditTop: { flexDirection: 'row', alignItems: 'center' },
    chip: {
      width: 34,
      height: 26,
      borderRadius: 6,
      backgroundColor: '#D9BE7E',
    },
    contactless: { marginLeft: 10, transform: [{ rotate: '90deg' }] },
    creditBrand: {
      flex: 1,
      textAlign: 'right',
      fontFamily: SERIF,
      fontSize: 13,
      letterSpacing: 1.6,
      fontWeight: '700',
      color: '#E4D7A8',
    },
    creditNumber: {
      fontSize: 19,
      letterSpacing: 2,
      fontWeight: '700',
      color: colors.white,
      marginTop: 24,
    },
    creditBottom: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 22 },
    creditLabel: {
      fontSize: 8.5,
      letterSpacing: 1.2,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.6)',
    },
    creditValue: { fontSize: 13.5, fontWeight: '700', color: colors.white, marginTop: 3, marginRight: 22 },
    creditType: {
      flex: 1,
      textAlign: 'right',
      fontSize: 11,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.75)',
    },

    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? colors.border : '#DCE2DD',
    },
    emptyText: { flex: 1, fontSize: 12.5, color: colors.placeholder, marginLeft: 10 },

    moreLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 12 },
    moreLinkText: { fontSize: 12, fontWeight: '700', color: colors.placeholder, marginRight: 4 },

    addressCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    addressIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addressTexts: { flex: 1, marginHorizontal: 12 },
    addressTop: { flexDirection: 'row', alignItems: 'center' },
    addressName: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 },
    defaultPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    defaultPillText: { fontSize: 8.5, letterSpacing: 0.6, fontWeight: '700', color: colors.primary },
    addressLine: { fontSize: 12.5, lineHeight: 18, color: colors.placeholder, marginTop: 5 },
    addressPhoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    addressPhone: { fontSize: 12, color: colors.placeholder, marginLeft: 5 },

    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowTexts: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    rowNote: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
    badge: {
      backgroundColor: isDark ? '#2E2716' : '#FBEAC4',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 8,
    },
    badgeStrong: { backgroundColor: colors.primary },
    badgeText: { fontSize: 11, fontWeight: '700', color: isDark ? '#E3BE72' : '#8A6D1F' },
    badgeTextStrong: { color: colors.white },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      borderRadius: 27,
      marginTop: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: colors.maroon, marginLeft: 8 },

    version: { fontSize: 11, color: colors.placeholder, textAlign: 'center', marginTop: 18 },
  });
