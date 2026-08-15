import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors.jsx';
import { useSplashLoader } from '../hooks/useSplashLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Pantalla de carga: además del tiempo mínimo, espera a saber si ya hay
// una sesión activa (cookie de login vigente) para saltar directo a Home
export default function LoadingScreen({ navigation }) {
  const { isReady } = useSplashLoader(1500);
  const { authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isReady && !authLoading) {
      navigation.replace(isAuthenticated ? 'Home' : 'Login');
    }
  }, [isReady, authLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>¡Bienvenido a Macetas!</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: { width: 110, height: 110, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  loader: { marginTop: 24 },
});
