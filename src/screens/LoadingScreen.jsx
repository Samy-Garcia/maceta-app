import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors.jsx';
import { useSplashLoader } from '../hooks/useSplashLoader.jsx';

// Pantalla de carga  
export default function LoadingScreen({ navigation }) {
  const { isReady } = useSplashLoader(1500);

  useEffect(() => {
    if (isReady) navigation.replace('Login');
  }, [isReady, navigation]);

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
