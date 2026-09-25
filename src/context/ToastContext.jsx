import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';

const ToastContext = createContext(null);

const KINDS = {
  success: { icon: 'checkmark-circle', tone: 'primary' },
  error: { icon: 'alert-circle', tone: 'maroon' },
  warning: { icon: 'warning', tone: 'gold' },
  info: { icon: 'information-circle', tone: 'primary' },
};

const DURATION = 3200;

// Avisos de la app. Reemplazan por completo a los Alert nativos:
//  - toast (success/error/warning/info): la tarjeta que baja y se va sola.
//  - confirm(): el diálogo que pide decidir y devuelve true/false.
//  - alert(): el diálogo de un solo botón, para lo que hay que leer con calma.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const timer = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [progress]);

  const show = useCallback(
    (next) => {
      clearTimeout(timer.current);
      setToast({ kind: 'success', ...next });
      progress.setValue(0);
      Animated.spring(progress, {
        toValue: 1,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(hide, next.duration || DURATION);
    },
    [hide, progress]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const api = useMemo(
    () => ({
      show,
      hide,
      success: (title, message, extra) => show({ kind: 'success', title, message, ...extra }),
      error: (title, message, extra) => show({ kind: 'error', title, message, ...extra }),
      warning: (title, message, extra) => show({ kind: 'warning', title, message, ...extra }),
      info: (title, message, extra) => show({ kind: 'info', title, message, ...extra }),
      // Diálogo con dos opciones. Se resuelve en true si se confirma.
      confirm: (options) =>
        new Promise((resolve) => {
          setDialog({
            kind: options.destructive ? 'error' : 'info',
            ...options,
            onResolve: (value) => {
              setDialog(null);
              resolve(value);
            },
          });
        }),
      // Diálogo de un solo botón (para explicaciones o resultados largos)
      alert: (options) =>
        new Promise((resolve) => {
          setDialog({
            kind: 'info',
            ...options,
            cancelLabel: null,
            onResolve: () => {
              setDialog(null);
              resolve(true);
            },
          });
        }),
    }),
    [show, hide]
  );
  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastCard toast={toast} progress={progress} onDismiss={hide} /> : null}
      <AlertDialog dialog={dialog} />
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, progress, onDismiss }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, isDark);
  const meta = KINDS[toast.kind] || KINDS.success;

  const toneColor =
    meta.tone === 'maroon' ? colors.maroon : meta.tone === 'gold' ? '#C9922F' : colors.primary;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-140, 0] });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + 8, opacity: progress, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onDismiss}>
        <View style={[styles.iconCircle, { backgroundColor: toneColor + '22' }]}>
          <Ionicons name={meta.icon} size={22} color={toneColor} />
        </View>

        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          {toast.message ? (
            <Text style={styles.message} numberOfLines={3}>{toast.message}</Text>
          ) : null}
        </View>

        {toast.actionLabel ? (
          <TouchableOpacity
            style={[styles.action, { backgroundColor: toneColor }]}
            onPress={() => {
              onDismiss();
              toast.onAction?.();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.actionText}>{toast.actionLabel}</Text>
          </TouchableOpacity>
        ) : (
          <Ionicons name="close" size={17} color={colors.placeholder} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Diálogo centrado, con el mismo lenguaje visual que los avisos. Sustituye
// al Alert del sistema en las confirmaciones (borrar, cerrar sesión, canjear).
function AlertDialog({ dialog }) {
  const { colors, isDark } = useTheme();
  const styles = createDialogStyles(colors, isDark);
  if (!dialog) return null;

  const meta = KINDS[dialog.kind] || KINDS.info;
  const tone =
    meta.tone === 'maroon' ? colors.maroon : meta.tone === 'gold' ? '#C9922F' : colors.primary;
  const hasCancel = dialog.cancelLabel !== null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => dialog.onResolve(false)}>
      <Pressable style={styles.backdrop} onPress={() => dialog.onResolve(false)}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconCircle, { backgroundColor: tone + '22' }]}>
            <Ionicons name={dialog.icon || meta.icon} size={30} color={tone} />
          </View>

          <Text style={styles.title}>{dialog.title}</Text>
          {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}

          <View style={styles.actions}>
            {hasCancel ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => dialog.onResolve(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>{dialog.cancelLabel || 'Cancelar'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: tone }, !hasCancel && styles.confirmFull]}
              onPress={() => dialog.onResolve(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>{dialog.confirmLabel || 'Aceptar'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    wrapper: { position: 'absolute', left: 14, right: 14, zIndex: 999, elevation: 999 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surface : colors.white,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
      shadowColor: '#0B2016',
      shadowOpacity: isDark ? 0.4 : 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    texts: { flex: 1, marginRight: 10 },
    title: { fontSize: 14, fontWeight: '700', color: colors.text },
    message: { fontSize: 12, lineHeight: 17, color: colors.placeholder, marginTop: 2 },
    action: { borderRadius: 16, paddingHorizontal: 12, height: 32, justifyContent: 'center' },
    actionText: { fontSize: 12, fontWeight: '700', color: colors.white },
  });

const createDialogStyles = (colors, isDark) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(8, 16, 11, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    card: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: isDark ? colors.surface : colors.white,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
      shadowColor: '#0B2016',
      shadowOpacity: 0.25,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    iconCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginTop: 16,
    },
    message: {
      fontSize: 13.5,
      lineHeight: 19,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 8,
    },
    actions: { flexDirection: 'row', alignItems: 'center', marginTop: 22, width: '100%' },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
    },
    cancelText: { fontSize: 14, fontWeight: '700', color: colors.text },
    confirmButton: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmFull: { flex: 1 },
    confirmText: { fontSize: 14, fontWeight: '700', color: colors.white },
  });
