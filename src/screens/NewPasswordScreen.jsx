import { StyleSheet, Text } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useNewPassword } from '../hooks/useNewPassword.jsx';

export default function NewPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    password, setPassword, confirmPassword, setConfirmPassword,
    loading, error, handleSavePassword, goToLogin,
  } = useNewPassword(navigation);

  return (
    <AuthCard>
      <Text style={styles.title}>Contraseña Nueva</Text>
      <Text style={styles.subtitle}>Ingrese Contraseña Nueva</Text>

      <FormInput
        label="Contraseña"
        placeholder="Ingresa Tu Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        label="Reescriba su contraseña"
        placeholder="Ingresa Tu Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.loginLink} onPress={goToLogin}>Iniciar Sesión</Text>

      <Button label="Guardar Contraseña" onPress={handleSavePassword} loading={loading} />

      <Divider />

      <GoogleButton />
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' },
    subtitle: { fontSize: 14, color: colors.placeholder, marginTop: 4, marginBottom: 20, textAlign: 'center' },
    error: { color: '#C0392B', fontSize: 12, alignSelf: 'flex-start', marginBottom: 8 },
    loginLink: { alignSelf: 'flex-end', color: colors.text, fontSize: 13, marginBottom: 16 },
  });
