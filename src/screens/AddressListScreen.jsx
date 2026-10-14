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
import { useAddressList } from '../hooks/useAddressList.jsx';

// Direcciones reales de la cuenta: se escriben a mano (sin mapa), aquí o al
// momento de confirmar un pedido. Solo los campos que de verdad guarda el
// backend — nombre, dirección, municipio/departamento, teléfono y principal.
export default function AddressListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { addresses, goToAddAddress, goToEditAddress, handleDelete, handleSetDefault, settingDefaultId } =
    useAddressList(navigation);

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
          <Text style={styles.title}>Mis Direcciones</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {addresses.length} {addresses.length === 1 ? 'GUARDADA' : 'GUARDADAS'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Puntos de entrega para tus pedidos.</Text>

        {addresses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="location-outline" size={24} color={colors.placeholder} />
            <Text style={styles.emptyText}>Todavía no tienes direcciones guardadas.</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons name="location" size={17} color={colors.primary} />
                </View>
                <View style={styles.cardTitles}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{address.fullName}</Text>
                    {address.isDefault ? (
                      <View style={styles.mainPill}>
                        <Text style={styles.mainPillText}>PRINCIPAL</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardPlace} numberOfLines={1}>
                    {[address.municipality, address.department].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardLine}>{address.addressLine}</Text>
              <Text style={styles.cardPhone}>{address.phone}</Text>

              <View style={styles.cardFooter}>
                {!address.isDefault ? (
                  <TouchableOpacity
                    style={styles.footerAction}
                    onPress={() => handleSetDefault(address)}
                    disabled={settingDefaultId === address._id}
                    activeOpacity={0.7}
                  >
                    {settingDefaultId === address._id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="star-outline" size={13} color={colors.primary} />
                        <Text style={styles.footerActionText}>Usar como principal</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => goToEditAddress(address)}
                  >
                    <Ionicons name="pencil" size={14} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconButton, styles.deleteButton]}
                    onPress={() => handleDelete(address)}
                  >
                    <Ionicons name="trash" size={14} color={colors.maroon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={goToAddAddress} activeOpacity={0.85}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={18} color={colors.white} />
          </View>
          <Text style={styles.addButtonText}>Agregar nueva dirección</Text>
        </TouchableOpacity>
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

    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    title: { flex: 1, fontFamily: SERIF, fontSize: 25, fontWeight: '700', color: colors.text },
    countPill: {
      backgroundColor: isDark ? colors.card : '#F2F4F2',
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    countPillText: { fontSize: 9, letterSpacing: 0.6, fontWeight: '700', color: colors.placeholder },
    subtitle: { fontSize: 12.5, color: colors.placeholder, marginTop: 4, marginBottom: 18 },

    emptyCard: {
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
    cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardTitles: { flex: 1 },
    cardNameRow: { flexDirection: 'row', alignItems: 'center' },
    cardName: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.text, marginRight: 8 },
    mainPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    mainPillText: { fontSize: 8.5, letterSpacing: 0.6, fontWeight: '700', color: colors.primary },
    cardPlace: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },

    cardLine: { fontSize: 12.5, color: colors.text, lineHeight: 18, marginTop: 10 },
    cardPhone: { fontSize: 12, color: colors.placeholder, marginTop: 4 },

    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerAction: { flexDirection: 'row', alignItems: 'center' },
    footerActionText: { fontSize: 11.5, fontWeight: '700', color: colors.primary, marginLeft: 5 },

    cardActions: { flexDirection: 'row' },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    deleteButton: { backgroundColor: isDark ? '#2F1F1D' : '#F8E2E2' },

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
  });
