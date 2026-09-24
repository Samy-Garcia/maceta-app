import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import AuthHeading from '../components/AuthHeading.jsx';
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
    <AuthCard scroll>
      <AuthHeading title="¡Bienvenido a Macetas!" subtitle="Inicia sesión en tu cuenta" />

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <FormInput
        label="Correo Electrónico"
        uppercaseLabel
        placeholder="nombre@ejemplo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <FormInput
        label="Contraseña"
        uppercaseLabel
        placeholder="Ingresa tu contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotLink}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
    notice: {
      fontSize: 13,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '600',
    },
    forgotLink: { alignSelf: 'flex-end', marginTop: 2, marginBottom: 18 },
    forgotText: { fontSize: 13, color: colors.text },
    registerLink: { marginTop: 18 },
    registerText: { fontSize: 13, color: colors.placeholder },
    registerBold: { color: colors.text, fontWeight: '700' },
  });
