import { useState } from 'react';
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
import { useRegister } from '../hooks/useRegister.jsx';
import { filterPhoneChars } from '../utils/validators.js';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    name, setName, lastName, setLastName, email, setEmail,
    phone, setPhone, address, setAddress,
    password, setPassword, confirmPassword, setConfirmPassword,
    referralCode, setReferralCode,
    loading, error, handleRegister, goToLogin, handleGoogleRegister, googleLoading,
  } = useRegister(navigation);

  // Solo controla el botón: la validación y el envío siguen viviendo en useRegister
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <AuthCard scroll>
      <AuthHeading title="Crear Cuenta" subtitle="Únete al club de botánica artesanal de El Salvador" />

      <FormInput label="Nombre" placeholder="Ingresa tu nombre" value={name} onChangeText={setName} />
      <FormInput label="Apellido" placeholder="Ingresa tu apellido" value={lastName} onChangeText={setLastName} />
      <FormInput
        label="Correo Electrónico"
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <FormInput
        label="Teléfono"
        placeholder="Ej. 503-7777-8888"
        value={phone}
        onChangeText={(text) => setPhone(filterPhoneChars(text))}
        keyboardType="phone-pad"
        maxLength={12}
      />
      <FormInput label="Dirección" placeholder="Ingresa tu dirección" value={address} onChangeText={setAddress} />
      <FormInput
        label="Contraseña"
        placeholder="Crea una contraseña segura"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        label="Confirmar Contraseña"
        placeholder="Repite tu contraseña"
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

      <TouchableOpacity
        style={styles.terms}
        onPress={() => setAcceptedTerms((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
          {acceptedTerms ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
        </View>
        <Text style={styles.termsText}>
          Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text> y la{' '}
          <Text style={styles.termsLink}>Política de Privacidad</Text>.
        </Text>
      </TouchableOpacity>

      <ErrorText message={error} />

      <Button
        label="Crear Cuenta"
        onPress={handleRegister}
        loading={loading}
        disabled={!acceptedTerms}
      />

      <Divider />

      <GoogleButton onPress={handleGoogleRegister} label="Registrarse con Google" loading={googleLoading} />

      <TouchableOpacity onPress={goToLogin} style={styles.loginLink}>
        <Text style={styles.loginText}>
          ¿Ya tienes una cuenta? <Text style={styles.loginBold}>Iniciar Sesión</Text>
        </Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    terms: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      marginTop: 2,
      marginBottom: 18,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      marginTop: 1,
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    termsText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.text },
    termsLink: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
    loginLink: { marginTop: 18 },
    loginText: { fontSize: 13, color: colors.placeholder },
    loginBold: { color: colors.text, fontWeight: '700' },
  });
