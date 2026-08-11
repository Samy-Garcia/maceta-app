import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import { colors } from '../theme/colors.jsx';
import { useRegister } from '../hooks/useRegister.jsx';

export default function RegisterScreen({ navigation }) {
  const {
    name, setName, email, setEmail, password, setPassword,
    loading, handleRegister, goToLogin, handleGoogleRegister,
  } = useRegister(navigation);

  return (
    <AuthCard>
      <Text style={styles.title}>Crear Cuenta</Text>

      <FormInput label="Nombre" placeholder="Ingresa Tu Nombre" value={name} onChangeText={setName} />
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

      <TouchableOpacity onPress={goToLogin} style={styles.forgotLink}>
        <Text style={styles.forgotText}>¿Olvidaste Tu Contraseña?</Text>
      </TouchableOpacity>

      <Button label="Iniciar Sesión" onPress={handleRegister} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleRegister} />

      <TouchableOpacity onPress={goToLogin} style={styles.registerLink}>
        <Text style={styles.registerText}>
          ¿No tienes cuenta? <Text style={styles.registerBold}>Registrarse</Text>
        </Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 20, textAlign: 'center' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: colors.text },
  registerLink: { marginTop: 16 },
  registerText: { fontSize: 13, color: colors.text },
  registerBold: { color: colors.primary, fontWeight: '700' },
});
