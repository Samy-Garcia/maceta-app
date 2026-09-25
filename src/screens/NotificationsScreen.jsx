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
import { useNotifications, KIND_STYLE, relativeLabel } from '../hooks/useNotifications.jsx';

export default function NotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    tabs, tab, setTab, counts, sections, isRead, unreadCount,
    loading, markAllRead, open,
  } = useNotifications(navigation);

  const toneOf = (kind) => {
    const tone = (KIND_STYLE[kind] || KIND_STYLE.novedades).tone;
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
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        <TouchableOpacity
          onPress={markAllRead}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="checkmark-done" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={styles.titleTexts}>
            <Text style={styles.overline}>BANDEJA DE AVISOS</Text>
            <Text style={styles.title}>Notificaciones</Text>
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.markAll} onPress={markAllRead} activeOpacity={0.8}>
              <Ionicons name="checkmark-done" size={15} color={colors.text} />
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.subtitle}>
          Mantente al día con tus pedidos, tu seguridad y las novedades del taller botánico.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((item) => {
            const active = item.key === tab;
            const count = counts[item.key] || 0;
            if (item.key !== 'todas' && count === 0) return null;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
                activeOpacity={0.8}
              >
                {item.icon ? (
                  <Ionicons
                    name={item.icon}
                    size={13}
                    color={active ? colors.white : colors.placeholder}
                    style={styles.tabIcon}
                  />
                ) : null}
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                {item.key === 'todas' && unreadCount > 0 ? (
                  <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
                      {unreadCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {!loading && sections.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={30} color={colors.placeholder} />
            <Text style={styles.emptyText}>
              No tienes avisos en esta categoría todavía.
            </Text>
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.title}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionDot} />
            </View>

            {section.data.map((item) => {
              const read = isRead(item);
              const tone = toneOf(item.kind);
              const icon = (KIND_STYLE[item.kind] || KIND_STYLE.novedades).icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, read && styles.cardRead]}
                  onPress={() => open(item)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.cardIcon, { backgroundColor: tone + '22' }]}>
                    <Ionicons name={icon} size={18} color={tone} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardOverline, { color: tone }]} numberOfLines={1}>
                        {item.overline}
                      </Text>
                      <Text style={styles.cardTime}>{relativeLabel(item.date)}</Text>
                      {!read ? <View style={styles.unreadDot} /> : null}
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.body ? (
                      <Text style={styles.cardText} numberOfLines={3}>{item.body}</Text>
                    ) : null}

                    <View style={styles.cardFooter}>
                      {item.tag ? (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                      ) : (
                        <View style={styles.tagSpacer} />
                      )}
                      {item.action?.label ? (
                        <View style={styles.actionRow}>
                          <Text style={[styles.actionText, { color: tone }]}>
                            {item.action.label}
                          </Text>
                          <Ionicons name="arrow-forward" size={13} color={tone} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity
          style={styles.prefsCard}
          onPress={() => navigation.navigate('NotificationPreferences')}
          activeOpacity={0.85}
        >
          <View style={styles.prefsIcon}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.prefsTexts}>
            <Text style={styles.prefsTitle}>Preferencias de avisos</Text>
            <Text style={styles.prefsNote}>Elige qué categorías quieres ver</Text>
          </View>
          <View style={styles.prefsButton}>
            <Text style={styles.prefsButtonText}>Configurar</Text>
          </View>
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
    headerTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    titleTexts: { flex: 1 },
    overline: { fontSize: 9.5, letterSpacing: 1.5, fontWeight: '700', color: colors.maroon },
    title: { fontFamily: SERIF, fontSize: 27, fontWeight: '700', color: colors.text, marginTop: 5 },
    markAll: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    markAllText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 6 },

    subtitle: { fontSize: 13, lineHeight: 19, color: colors.placeholder, marginTop: 8 },

    tabsRow: { paddingVertical: 16, paddingRight: 8 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      height: 36,
      borderRadius: 18,
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabIcon: { marginRight: 6 },
    tabText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
    tabTextActive: { color: colors.white },
    tabBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 7,
      backgroundColor: colors.primary,
    },
    tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    tabBadgeText: { fontSize: 10.5, fontWeight: '700', color: colors.white },
    tabBadgeTextActive: { color: colors.white },

    loader: { marginVertical: 26 },
    emptyBox: { alignItems: 'center', paddingVertical: 40 },
    emptyText: {
      fontSize: 13,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 20,
    },

    sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 10 },
    sectionTitle: {
      flex: 1,
      fontSize: 10,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: colors.placeholder,
    },
    sectionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.border },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardRead: { opacity: 0.72 },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardBody: { flex: 1 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardOverline: { flex: 1, fontSize: 9, letterSpacing: 1.1, fontWeight: '700' },
    cardTime: { fontSize: 10.5, color: colors.placeholder },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: 7,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 6 },
    cardText: { fontSize: 12.5, lineHeight: 18, color: colors.placeholder, marginTop: 5 },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    tag: {
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      borderRadius: 9,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    tagText: { fontSize: 10.5, fontWeight: '700', color: colors.placeholder },
    tagSpacer: { flex: 1 },
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    actionText: { fontSize: 12.5, fontWeight: '700', marginRight: 5 },

    prefsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      borderRadius: 18,
      padding: 14,
      marginTop: 14,
    },
    prefsIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    prefsTexts: { flex: 1, marginRight: 10 },
    prefsTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    prefsNote: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },
    prefsButton: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    prefsButtonText: { fontSize: 12.5, fontWeight: '700', color: colors.text },

  });
