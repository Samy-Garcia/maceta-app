import { StyleSheet, Text } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import OTPInput from '../components/OTPInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import { colors } from '../theme/colors.jsx';
import { useVerification } from '../hooks/useVerification.jsx';

export default function VerificationScreen({ navigation }) {
  const { code, setCode, loading, handleVerifyCode, handleGoogleLogin } = useVerification(navigation);

  return (
    <AuthCard>
      <Text style={styles.subtitle}>Ingrese Codigo De Verificacion</Text>
      <Text style={styles.label}>Codigo</Text>

      <OTPInput value={code} onChange={setCode} />

      <Button label="Siguiente" onPress={handleVerifyCode} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleLogin} />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 16, color: colors.placeholder, marginTop: 16, marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, alignSelf: 'flex-start', marginBottom: 8 },
});
