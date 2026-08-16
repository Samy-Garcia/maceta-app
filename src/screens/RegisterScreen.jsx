import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthCard from '../components/AuthCard.jsx';
import FormInput from '../components/FormInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useRegister } from '../hooks/useRegister.jsx';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    name, setName, lastName, setLastName, email, setEmail,
    phone, setPhone, address, setAddress,
    password, setPassword, confirmPassword, setConfirmPassword,
    referralCode, setReferralCode,
    loading, error, handleRegister, goToLogin, handleGoogleRegister,
  } = useRegister(navigation);

  return (
    <AuthCard scroll>
      <Text style={styles.title}>Crear Cuenta</Text>

      <FormInput label="Nombre" placeholder="Ingresa Tu Nombre" value={name} onChangeText={setName} />
      <FormInput label="Apellido" placeholder="Ingresa Tu Apellido" value={lastName} onChangeText={setLastName} />
      <FormInput
        label="Correo Electrónico"
        placeholder="Ingresa tu Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <FormInput
        label="Teléfono"
        placeholder="Ej. 503-7777-8888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <FormInput label="Dirección" placeholder="Ingresa Tu Dirección" value={address} onChangeText={setAddress} />
      <FormInput
        label="Contraseña"
        placeholder="Ingresa Tu Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        label="Confirmar Contraseña"
        placeholder="Repite Tu Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <FormInput
        label="Código de Referido (opcional)"
        placeholder="Ej. M503-A1B2C3"
        value={referralCode}
        onChangeText={setReferralCode}
        autoCapitalize="characters"
      />

      <ErrorText message={error} />

      <Button label="Crear Cuenta" onPress={handleRegister} loading={loading} />

      <Divider />

      <GoogleButton onPress={handleGoogleRegister} label="Regístrate Con Google" />

      <TouchableOpacity onPress={goToLogin} style={styles.registerLink}>
        <Text style={styles.registerText}>
          ¿Ya tienes cuenta? <Text style={styles.registerBold}>Iniciar Sesión</Text>
        </Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 20, textAlign: 'center' },
    registerLink: { marginTop: 16 },
    registerText: { fontSize: 13, color: colors.text },
    registerBold: { color: colors.primary, fontWeight: '700' },
  });
