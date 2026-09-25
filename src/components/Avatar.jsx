import { Image, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

const DEFAULT_AVATAR = require('../../assets/avatar-default.png');

// Foto de perfil del cliente. Sale la que tenga guardada la cuenta (la que
// sube en Editar perfil, o la que traiga su cuenta de Google) y, si no tiene
// ninguna, el avatar por defecto del atelier.
//
// `uri` permite forzar una imagen concreta: lo usa Editar perfil para mostrar
// la foto recién elegida antes de guardarla.
export default function Avatar({ size = 32, uri, style }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const photo = uri || user?.photo;

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft },
        style,
      ]}
    >
      <Image
        source={photo ? { uri: photo } : DEFAULT_AVATAR}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
});
