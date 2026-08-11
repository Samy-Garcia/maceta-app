import { Image, StyleSheet } from 'react-native';

// Logo de la hoja de monstera
export default function Logo({ size = 90 }) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: { alignSelf: 'center' },
});
