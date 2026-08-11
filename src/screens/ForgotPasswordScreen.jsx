import { StyleSheet, Text } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import { colors } from '../theme/colors.jsx';
import { useForgotPassword } from '../hooks/useForgotPassword.jsx';

export default function ForgotPasswordScreen({ navigation }) {
  const { email, setEmail, loading, handleSendCode, handleGoogleLogin } = useForgotPassword(navigation);

  return (
    <AuthCard>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>Ingrese Su Correo</Text>

      <FormInput
        label="Correo Electrónico"
        placeholder="Ingresa tu Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button label="Siguiente" onPress={handleSendCode} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleLogin} />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.placeholder, marginTop: 4, marginBottom: 20 },
});
