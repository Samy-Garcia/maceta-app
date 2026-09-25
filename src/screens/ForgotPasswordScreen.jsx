import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthCard from '../components/AuthCard.jsx';
import AuthHeading from '../components/AuthHeading.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useForgotPassword } from '../hooks/useForgotPassword.jsx';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { email, setEmail, loading, error, handleSendCode, handleGoogleLogin, googleLoading } =
    useForgotPassword(navigation);

  return (
    <AuthCard scroll>
      <AuthHeading
        title="Recuperar Contraseña"
        subtitle="Ingresa tu correo para recibir un código de restablecimiento seguro"
      />

      <FormInput
        label="Correo Electrónico"
        placeholder="Ingresa tu Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <ErrorText message={error} />

      <Button label="Enviar Instrucciones" onPress={handleSendCode} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleLogin} loading={googleLoading} />

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={15} color={colors.text} />
        <Text style={styles.backText}>Volver a Iniciar Sesión</Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backLink: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
    backText: { fontSize: 13, color: colors.text, marginLeft: 2 },
  });
