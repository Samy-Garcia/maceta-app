import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthCard from '../components/AuthCard.jsx';
import AuthHeading from '../components/AuthHeading.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
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
    <AuthCard
      scroll
      headerTitle="MACETAS 503"
      onBack={() => navigation.goBack()}
      footerNote="© Macetas503 • Arte botánico & naturaleza"
    >
      <AuthHeading
        title="Contraseña Nueva"
        subtitle="Crea una contraseña segura para proteger tu cuenta de Macetas503."
      />

      <FormInput
        label="Nueva Contraseña"
        placeholder="Ingresa tu nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        label="Reescribir Contraseña"
        placeholder="Confirma tu nueva contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
        <Text style={styles.hintText}>
          Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo.
        </Text>
      </View>

      <ErrorText message={error} />

      <Button
        label="Guardar Contraseña"
        onPress={handleSavePassword}
        loading={loading}
        iconRight="arrow-forward"
      />

      <Divider />

      <GoogleButton />

      <TouchableOpacity style={styles.loginLink} onPress={goToLogin} activeOpacity={0.7}>
        <Text style={styles.loginText}>Volver a Iniciar Sesión</Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    hint: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginBottom: 18,
    },
    hintText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.placeholder, marginLeft: 8 },
    loginLink: { marginTop: 18 },
    loginText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  });
