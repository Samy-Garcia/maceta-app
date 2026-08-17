import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useProfile } from '../hooks/useProfile.jsx';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, fullName, isDark, toggleTheme, menuItems, handleLogout } = useProfile(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color={colors.white} />
            )}
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>
        ))}

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={20} color={colors.primary} />
          </View>
          <View style={styles.rowTextWrapper}>
            <Text style={styles.rowLabel}>Tema</Text>
            <Text style={styles.rowSubtitle}>Modo oscuro/claro</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <View style={styles.rowIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.rowTextWrapper}>
            <Text style={styles.rowLabel}>Seguridad</Text>
            <Text style={styles.rowSubtitle}>Cambiar contraseña</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={colors.white} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Perfil" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    header: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 18 },
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 20 },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 24,
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.accentPink,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginBottom: 14,
    },
    avatarImage: { width: '100%', height: '100%' },
    name: { fontSize: 18, fontWeight: '700', color: colors.text },
    email: { fontSize: 13, color: colors.placeholder, marginTop: 4 },
    editButton: {
      marginTop: 16,
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 28,
    },
    editButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
    },
    rowIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowTextWrapper: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
    rowSubtitle: { fontSize: 12, color: colors.placeholder, marginTop: 2 },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.maroonDark,
      borderRadius: 12,
      paddingVertical: 15,
      marginTop: 8,
    },
    logoutText: { color: colors.white, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  });
