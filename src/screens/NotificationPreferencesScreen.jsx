import {
  ActivityIndicator,
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
import { useNotificationPrefs } from '../hooks/useNotificationPrefs.jsx';
import { formatHour } from '../services/notificationsStorage.js';

export default function NotificationPreferencesScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    prefs, toggle, setAccess, loading, silenced,
    activeChannels, activeCategories, isDirty, save, openSystemSettings,
    accessLevels, channels, categories,
  } = useNotificationPrefs(navigation);

  const toneOf = (tone) => {
    if (tone === 'maroon') return colors.maroon;
    if (tone === 'gold') return '#C9922F';
    if (tone === 'neutral') return colors.text;
    return colors.primary;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerBrand}>MACETAS503</Text>
          <Text style={styles.headerTitle}>Notification Preferences</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.systemPill}>
          <Text style={styles.systemPillText}>AJUSTES DEL SISTEMA</Text>
        </View>

        <Text style={styles.title}>Notificaciones y Permisos</Text>
        <Text style={styles.subtitle}>
          Administra cuándo y cómo Macetas503 puede enviarte alertas sobre tus pedidos, novedades y
          seguridad.
        </Text>

        <View style={styles.accessCard}>
          <View style={styles.accessTop}>
            <View style={styles.accessIcon}>
              <Ionicons name="notifications" size={19} color="#E4D7A8" />
            </View>
            <View style={styles.accessTitles}>
              <Text style={styles.accessEyebrow}>PERMISO DE DISPOSITIVO</Text>
              <Text style={styles.accessTitle}>Nivel de Acceso</Text>
            </View>
            <View style={[styles.accessBadge, silenced && styles.accessBadgeOff]}>
              <Text style={[styles.accessBadgeText, silenced && styles.accessBadgeTextOff]}>
                {silenced ? 'Silenciado' : 'En uso'}
              </Text>
            </View>
          </View>

          <Text style={styles.accessText}>
            Elige en qué momentos permites que el atelier sincronice el estado botánico y las
            alertas logísticas con tu dispositivo.
          </Text>

          {accessLevels.map((level) => {
            const active = prefs.access === level.key;
            return (
              <TouchableOpacity
                key={level.key}
                style={[styles.levelRow, active && styles.levelRowActive]}
                onPress={() => setAccess(level.key)}
                activeOpacity={0.85}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.levelTexts}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelLabel}>{level.label}</Text>
                    {level.recommended ? (
                      <View style={styles.recommendedPill}>
                        <Text style={styles.recommendedText}>Recomendado</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.levelNote}>{level.note}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Canales de Notificación</Text>
          <Text style={styles.sectionHint}>
            {activeChannels} {activeChannels === 1 ? 'Activo' : 'Activos'}
          </Text>
        </View>

        <View style={[styles.card, silenced && styles.cardMuted]}>
          {channels.map((channel, index) => (
            <View key={channel.key} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.rowIcon}>
                <Ionicons name={channel.icon} size={17} color={colors.primary} />
              </View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{channel.label}</Text>
                <Text style={styles.rowNote}>{channel.note}</Text>
              </View>
              <Switch
                value={!silenced && !!prefs[channel.key]}
                onValueChange={() => toggle(channel.key)}
                disabled={silenced}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Categorías de Alertas</Text>
          <Text style={styles.sectionAction}>
            {activeCategories === categories.length ? 'TODAS' : 'PERSONALIZADO'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.card}>
            {categories.map((category, index) => {
              const tone = toneOf(category.tone);
              return (
                <View key={category.key} style={[styles.row, index > 0 && styles.rowDivider]}>
                  <View style={[styles.rowIcon, { backgroundColor: tone + '22' }]}>
                    <Ionicons name={category.icon} size={17} color={tone} />
                  </View>
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowLabel}>{category.label}</Text>
                    <Text style={styles.rowNote}>{category.note}</Text>
                  </View>
                  <Switch
                    value={!!prefs[category.key]}
                    onValueChange={() => toggle(category.key)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Discreción y Silencio</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="moon" size={17} color={colors.primary} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowLabel}>Horario No Molestar</Text>
              <Text style={styles.rowNote}>
                Pausa alertas de {formatHour(prefs.quietFrom)} a {formatHour(prefs.quietTo)} salvo
                entregas en tránsito.
              </Text>
            </View>
            <Switch
              value={!!prefs.quietHours}
              onValueChange={() => toggle('quietHours')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <Text style={styles.footNote}>
          Las categorías y el horario ya filtran tu bandeja de avisos. Push, correo y WhatsApp se
          guardan aquí y empezarán a enviarse en cuanto el taller habilite los envíos.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
          onPress={save}
          disabled={!isDirty}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={17} color={colors.white} />
          <Text style={styles.saveButtonText}>Guardar Preferencias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={openSystemSettings}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={15} color={colors.text} />
          <Text style={styles.secondaryButtonText}>Abrir ajustes del teléfono</Text>
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
    headerTitles: { alignItems: 'center' },
    headerBrand: { fontSize: 8.5, letterSpacing: 1.8, fontWeight: '700', color: colors.maroon },
    headerTitle: { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 2 },
    headerSpacer: { width: 22 },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    systemPill: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? colors.card : '#EDF0ED',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop: 6,
    },
    systemPillText: { fontSize: 9, letterSpacing: 1.3, fontWeight: '700', color: colors.placeholder },
    title: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 12 },
    subtitle: { fontSize: 13, lineHeight: 19, color: colors.placeholder, marginTop: 8 },

    accessCard: {
      backgroundColor: isDark ? '#17301F' : '#14301F',
      borderRadius: 22,
      padding: 18,
      marginTop: 20,
    },
    accessTop: { flexDirection: 'row', alignItems: 'center' },
    accessIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    accessTitles: { flex: 1 },
    accessEyebrow: { fontSize: 8.5, letterSpacing: 1.4, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
    accessTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: '#FFFFFF', marginTop: 3 },
    accessBadge: {
      backgroundColor: '#CFE9D8',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    accessBadgeOff: { backgroundColor: 'rgba(255,255,255,0.16)' },
    accessBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#1B4D2E' },
    accessBadgeTextOff: { color: '#FFFFFF' },
    accessText: {
      fontSize: 12.5,
      lineHeight: 18,
      color: 'rgba(255,255,255,0.62)',
      marginTop: 14,
      marginBottom: 6,
    },

    levelRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 14,
      padding: 13,
      marginTop: 8,
    },
    levelRowActive: { backgroundColor: 'rgba(255,255,255,0.07)' },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    radioActive: { borderColor: '#8FCBA4' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8FCBA4' },
    levelTexts: { flex: 1, marginLeft: 12 },
    levelTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    levelLabel: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginRight: 8 },
    recommendedPill: {
      backgroundColor: '#B35226',
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    recommendedText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    levelNote: {
      fontSize: 11.5,
      lineHeight: 16.5,
      color: 'rgba(255,255,255,0.6)',
      marginTop: 4,
    },

    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 26,
      marginBottom: 12,
    },
    sectionTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    sectionHint: { fontSize: 11, fontWeight: '600', color: colors.placeholder },
    sectionAction: { fontSize: 9.5, letterSpacing: 1, fontWeight: '700', color: colors.maroon },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardMuted: { opacity: 0.55 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    rowIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowTexts: { flex: 1, marginRight: 10 },
    rowLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    rowNote: { fontSize: 11.5, lineHeight: 16, color: colors.placeholder, marginTop: 3 },

    loader: { marginVertical: 24 },
    footNote: { fontSize: 11.5, lineHeight: 17, color: colors.placeholder, marginTop: 16 },

    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 20,
      backgroundColor: isDark ? colors.primary : '#14301F',
    },
    saveButtonDisabled: { opacity: 0.45 },
    saveButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginLeft: 9 },

    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 26,
      marginTop: 10,
      backgroundColor: isDark ? colors.card : '#EDF0ED',
    },
    secondaryButtonText: { fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 8 },
  });
