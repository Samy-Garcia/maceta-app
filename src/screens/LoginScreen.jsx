import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { colors } from '../theme/colors.jsx';
import { useLogin } from '../hooks/useLogin.jsx';

export default function LoginScreen({ navigation }) {
  const {
    email, setEmail, password, setPassword, loading, error,
    handleLogin, goToRegister, goToForgotPassword, handleGoogleLogin,
  } = useLogin(navigation);

  return (
    <AuthCard>
      <Text style={styles.title}>¡Bienvenido a Macetas!</Text>
      <Text style={styles.subtitle}>Inicia Sesión</Text>

      <FormInput
        label="Correo Electrónico"
        placeholder="Ingresa tu Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <FormInput
        label="Contraseña"
        placeholder="Ingresa Tu Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotLink}>
        <Text style={styles.forgotText}>¿Olvidaste Tu Contraseña?</Text>
      </TouchableOpacity>

      <ErrorText message={error} />

      <Button label="Iniciar Sesión" onPress={handleLogin} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleLogin} />

      <TouchableOpacity onPress={goToRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>
          ¿No tienes cuenta? <Text style={styles.registerBold}>Registrarse</Text>
        </Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.placeholder, marginTop: 4, marginBottom: 20 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 12 },
  forgotText: { fontSize: 13, color: colors.text },
  registerLink: { marginTop: 16 },
  registerText: { fontSize: 13, color: colors.text },
  registerBold: { color: colors.primary, fontWeight: '700' },
});
