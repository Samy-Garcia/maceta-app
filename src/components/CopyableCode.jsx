import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Código que se puede copiar de un toque (referidos, cupones). Confirma con
// un check dentro del mismo botón además del aviso, para que se vea que algo
// pasó aunque el aviso ya se haya ido.
export default function CopyableCode({ code, label = 'Código copiado', hint = 'Toca para copiar' }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    if (!code) return;
    try {
      await Clipboard.setStringAsync(String(code));
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
      toast.success(label, code);
    } catch {
      toast.error('No se pudo copiar', 'Tu dispositivo no permitió el acceso al portapapeles.');
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={copy} activeOpacity={0.8}>
      <View style={styles.texts}>
        <Text style={styles.code} selectable>{code}</Text>
        <Text style={styles.hint}>{copied ? '¡Copiado al portapapeles!' : hint}</Text>
      </View>
      <View style={[styles.button, copied && styles.buttonDone]}>
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={16}
          color={copied ? colors.white : colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginTop: 8,
    },
    texts: { flex: 1, marginRight: 12 },
    code: { fontSize: 18, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
    hint: { fontSize: 10.5, color: colors.placeholder, marginTop: 3 },
    button: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surface : colors.white,
    },
    buttonDone: { backgroundColor: colors.primary },
  });
