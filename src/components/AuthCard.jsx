import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from './ScreenBackground.jsx';
import Logo from './Logo.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

// Tarjeta blanca centrada con el logo arriba, reutilizada por Login, Register,
// ForgotPassword, Verification y NewPassword.
// headerTitle/onBack dibujan la barra superior y footerNote la línea de pie.
export default function AuthCard({
  children,
  logoSize = 60,
  scroll = false,
  headerTitle,
  onBack,
  footerNote,
}) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const header = headerTitle ? (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerSide}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={styles.headerTitle}>{headerTitle}</Text>
      <View style={styles.headerSide} />
    </View>
  ) : null;

  const body = (
    <>
      <View style={styles.card}>
        <Logo size={logoSize} />
        {children}
      </View>
      {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
    </>
  );

  return (
    <ScreenBackground>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.content}>{body}</View>
      )}
    </ScreenBackground>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    headerSide: { width: 32, alignItems: 'flex-start' },
    headerTitle: {
      fontSize: 12,
      letterSpacing: 2.6,
      fontWeight: '600',
      color: colors.placeholder,
    },
    content: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      paddingVertical: 28,
    },
    card: {
      width: '100%',
      backgroundColor: isDark ? colors.card : colors.surface,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 26,
      alignItems: 'center',
      shadowColor: '#0B2016',
      shadowOpacity: isDark ? 0 : 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: isDark ? 0 : 3,
    },
    footerNote: {
      marginTop: 22,
      fontSize: 11,
      color: colors.placeholder,
      textAlign: 'center',
    },
  });
