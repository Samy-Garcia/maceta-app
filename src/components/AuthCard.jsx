import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenBackground from './ScreenBackground.jsx';
import Logo from './Logo.jsx';
import { colors } from '../theme/colors.jsx';

// reutilizada por Login, Register, ForgotPassword, Verification y
// NewPassword porque llevael fondo de florcitas, tarjeta blanca centrada cuando carga mas ellogo arriba.
export default function AuthCard({ children, logoSize = 80, scroll = false }) {
  if (scroll) {
    return (
      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Logo size={logoSize} />
            {children}
          </View>
        </ScrollView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.content}>
        <View style={styles.card}>
          <Logo size={logoSize} />
          {children}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
});
