import { StyleSheet, Text } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import OTPInput from '../components/OTPInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useVerification } from '../hooks/useVerification.jsx';

export default function VerificationScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { code, setCode, loading, error, handleVerifyCode, handleGoogleLogin, email } = useVerification(
    navigation,
    route?.params
  );

  return (
    <AuthCard>
      <Text style={styles.subtitle}>Ingrese Codigo De Verificacion</Text>
      {email ? <Text style={styles.emailText}>Enviado a {email}</Text> : null}
      <Text style={styles.label}>Codigo</Text>

      <OTPInput value={code} onChange={setCode} />

      <ErrorText message={error} />

      <Button label="Siguiente" onPress={handleVerifyCode} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleLogin} />
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    subtitle: { fontSize: 16, color: colors.placeholder, marginTop: 16, marginBottom: 4, textAlign: 'center' },
    emailText: { fontSize: 12, color: colors.text, marginBottom: 12, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, alignSelf: 'flex-start', marginBottom: 8 },
  });
