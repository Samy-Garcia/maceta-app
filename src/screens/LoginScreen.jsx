import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useLogin } from '../hooks/useLogin.jsx';

export default function LoginScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    email, setEmail, password, setPassword, loading, error,
    handleLogin, goToRegister, goToForgotPassword, handleGoogleLogin,
  } = useLogin(navigation);

  const notice = route?.params?.registered
    ? 'Cuenta creada correctamente. Ya puedes iniciar sesión.'
    : route?.params?.passwordReset
    ? 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.'
    : '';

  return (
    <AuthCard>
      <Text style={styles.title}>¡Bienvenido a Macetas!</Text>
      <Text style={styles.subtitle}>Inicia Sesión</Text>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

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

const createStyles = (colors) =>
  StyleSheet.create({
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' },
    subtitle: { fontSize: 14, color: colors.placeholder, marginTop: 4, marginBottom: 12 },
    notice: {
      fontSize: 13,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '600',
    },
    forgotLink: { alignSelf: 'flex-end', marginBottom: 12 },
    forgotText: { fontSize: 13, color: colors.text },
    registerLink: { marginTop: 16 },
    registerText: { fontSize: 13, color: colors.text },
    registerBold: { color: colors.primary, fontWeight: '700' },
  });
