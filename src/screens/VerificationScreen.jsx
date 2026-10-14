import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthCard from '../components/AuthCard.jsx';
import AuthHeading from '../components/AuthHeading.jsx';
import OTPInput from '../components/OTPInput.jsx';
import Button from '../components/Button.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import Divider from '../components/Divider.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { lightColors } from '../theme/palettes.js';
import { useVerification } from '../hooks/useVerification.jsx';

const RESEND_SECONDS = 45;

const formatSeconds = (total) => {
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function VerificationScreen({ navigation, route }) {
  // Fija colores claros: el flujo de autenticación no sigue el modo oscuro.
  const colors = lightColors;
  const styles = createStyles(colors);
  const { code, setCode, loading, error, handleVerifyCode, handleGoogleLogin, googleLoading, email } = useVerification(
    navigation,
    route?.params
  );

  // Cuenta regresiva para habilitar el reenvío. Como el código lo emite la
  // pantalla anterior (registro o recuperación), reenviar es volver a ella:
  // el formulario sigue montado con los datos escritos.
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const canResend = secondsLeft <= 0;

  return (
    <AuthCard scroll>
      <AuthHeading
        title="Código de Verificación"
        subtitle={
          email
            ? `Hemos enviado un código de 6 dígitos a ${email}.`
            : 'Hemos enviado un código de 6 dígitos a tu correo electrónico registrado.'
        }
      />

      <OTPInput value={code} onChange={setCode} />

      <View style={styles.resendRow}>
        <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={!canResend}>
          <Text style={[styles.resendAction, !canResend && styles.resendDisabled]}>
            Reenviar código{canResend ? '' : ` (${formatSeconds(secondsLeft)})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ErrorText message={error} />

      <Button label="Verificar Código" onPress={handleVerifyCode} loading={loading} />

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
    resendRow: { alignItems: 'center', marginBottom: 18 },
    resendQuestion: { fontSize: 12.5, color: colors.placeholder },
    resendAction: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 4 },
    resendDisabled: { color: colors.placeholder, fontWeight: '600' },
    backLink: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
    backText: { fontSize: 13, color: colors.text, marginLeft: 2 },
  });
