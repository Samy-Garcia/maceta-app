import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext.jsx';

// Pantalla de carga Splash Screencon el logo de macetas403
export default function SplashScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Loading'), 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    logo: {
      width: 140,
      height: 140,
    },
  });
