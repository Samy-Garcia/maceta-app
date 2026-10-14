import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightColors } from '../theme/palettes.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SERIF } from '../theme/typography.js';
import { backdropFor } from '../theme/gradients.js';
import { useBackdropStatusBar } from '../hooks/useBackdropStatusBar.jsx';

// Pantalla de bienvenida: presenta la marca y da entrada a Login / Registro.
// Si ya hay una sesión activa (cookie vigente) entra directo a Home.
// Fija colores claros: el flujo de autenticación no sigue el modo oscuro que
// elija el usuario en el resto de la app.
export default function SplashScreen({ navigation }) {
  const colors = lightColors;
  const isDark = false;
  const { authLoading, isAuthenticated } = useAuth();
  const styles = createStyles(colors, isDark);

  useBackdropStatusBar();

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigation.replace('Home');
  }, [authLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={backdropFor(false)} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <View style={styles.location}>
            <View style={styles.dot} />
            <Text style={styles.topLabel}>EL SALVADOR</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.glowOuter} />
            <View style={styles.glowInner} />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brand}>
            Macetas<Text style={styles.brandNumber}>503</Text>
          </Text>

          <View style={styles.tagRow}>
            <View style={styles.tagLine} />
            <Text style={styles.tagText}>BOTÁNICA</Text>
            <View style={styles.tagLine} />
          </View>

        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryLabel}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryLabel}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors, isDark) => {
  const brandGreen = isDark ? '#8FC4A3' : colors.primary;
  const softGreen = isDark ? '#6FA384' : '#4A8062';
  const hairline = isDark ? 'rgba(143, 196, 163, 0.35)' : 'rgba(27, 77, 46, 0.3)';

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: isDark ? colors.background : '#F4F9F5' },
    safeArea: { flex: 1, paddingHorizontal: 28 },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
    },
    location: { flexDirection: 'row', alignItems: 'center' },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: brandGreen,
      marginRight: 8,
    },
    topLabel: {
      fontSize: 11,
      letterSpacing: 2.4,
      fontWeight: '700',
      color: brandGreen,
    },

    hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    // El halo mide 260 y el logo 150: el círculo sobresale 55px por debajo,
    // así que el margen debe pasar de eso para que se vea aire entre el
    // círculo y las letras (110 - 55 = 55px de separación real).
    logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 110 },
    glowOuter: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: isDark ? 'rgba(143, 196, 163, 0.05)' : 'rgba(27, 77, 46, 0.04)',
    },
    glowInner: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: isDark ? 'rgba(143, 196, 163, 0.06)' : 'rgba(27, 77, 46, 0.05)',
    },
    logo: { width: 150, height: 150 },

    brand: {
      fontFamily: SERIF,
      fontSize: 38,
      color: brandGreen,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    brandNumber: {
      fontFamily: SERIF,
      fontSize: 34,
      fontStyle: 'italic',
      color: softGreen,
    },

    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    tagLine: { width: 26, height: 1, backgroundColor: hairline },
    tagText: {
      fontSize: 12,
      letterSpacing: 3,
      fontWeight: '700',
      color: brandGreen,
      marginHorizontal: 12,
    },

    actions: { paddingBottom: 12 },
    primaryButton: {
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.3,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    primaryLabel: { color: colors.white, fontSize: 17, fontWeight: '700' },
    secondaryButton: {
      height: 56,
      borderRadius: 28,
      marginTop: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.75)',
      borderWidth: 1,
      borderColor: hairline,
    },
    secondaryLabel: {
      color: isDark ? colors.text : '#1F2D25',
      fontSize: 17,
      fontWeight: '600',
    },
  });
};
