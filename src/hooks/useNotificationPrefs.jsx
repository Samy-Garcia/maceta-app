import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { DEFAULT_PREFS, getPrefs, savePrefs } from '../services/notificationsStorage.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Cuándo permites que la app te avise
export const ACCESS_LEVELS = [
  {
    key: 'always',
    label: 'Todo el tiempo',
    note: 'Alertas inmediatas y rastreo de mensajería en segundo plano.',
    recommended: true,
  },
  {
    key: 'app',
    label: 'Solo con la app en uso',
    note: 'Avisos activos únicamente mientras exploras o revisas el catálogo.',
  },
  {
    key: 'off',
    label: 'No permitir / Silenciar',
    note: 'Deshabilita todas las notificaciones en este terminal.',
  },
];

// Por dónde te llegan
export const CHANNELS = [
  {
    key: 'push',
    icon: 'phone-portrait-outline',
    label: 'Avisos push',
    note: 'Directo en la pantalla de bloqueo de tu dispositivo móvil.',
  },
  {
    key: 'email',
    icon: 'mail-outline',
    label: 'Mensajes por correo',
    note: 'Resumen de colecciones botánicas y confirmaciones de pago.',
  },
  {
    key: 'whatsapp',
    icon: 'chatbubble-ellipses-outline',
    label: 'WhatsApp y SMS',
    note: 'Avisos al momento en que el mensajero salga a ruta.',
  },
];

// Qué te avisa. Estas cuatro ya filtran lo que ves en la bandeja.
export const ALERT_CATEGORIES = [
  {
    key: 'pedidos',
    icon: 'car',
    label: 'Estado de pedidos',
    note: 'Confirmación, preparación y ruta en vivo.',
    tone: 'maroon',
  },
  {
    key: 'novedades',
    icon: 'flower',
    label: 'Nuevas colecciones',
    note: 'Lanzamientos de alfarería en gres, concreto y botánica rara.',
    tone: 'primary',
  },
  {
    key: 'seguridad',
    icon: 'shield-checkmark',
    label: 'Seguridad y cuenta',
    note: 'Claves, nuevos accesos y validación de cobro segura.',
    tone: 'neutral',
  },
  {
    key: 'club',
    icon: 'leaf',
    label: 'Club botánico y puntos',
    note: 'Hojas de alfarero ganadas y cupones por caducar.',
    tone: 'gold',
  },
];

export function useNotificationPrefs(navigation) {
  const { user } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saved, setSaved] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrefs(user?.email)
      .then((stored) => {
        setPrefs(stored);
        setSaved(stored);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAccess = (access) => setPrefs((prev) => ({ ...prev, access }));

  const silenced = prefs.access === 'off';
  const activeChannels = silenced ? 0 : CHANNELS.filter((channel) => prefs[channel.key]).length;
  const activeCategories = ALERT_CATEGORIES.filter((category) => prefs[category.key]).length;

  const isDirty = Object.keys(DEFAULT_PREFS).some((key) => prefs[key] !== saved[key]);

  const save = async () => {
    await savePrefs(user?.email, prefs);
    setSaved(prefs);
    toast.success(
      'Preferencias guardadas',
      silenced
        ? 'Silenciaste los avisos en este dispositivo.'
        : activeCategories + ' de ' + ALERT_CATEGORIES.length + ' categorías activas'
    );
    navigation?.goBack();
  };

  // Los permisos del sistema se administran en los ajustes del teléfono
  const openSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() =>
      toast.error('No se pudo abrir', 'Abre los ajustes de tu teléfono manualmente.')
    );
  }, [toast]);

  return {
    prefs,
    toggle,
    setAccess,
    loading,
    silenced,
    activeChannels,
    activeCategories,
    isDirty,
    save,
    openSystemSettings,
    accessLevels: ACCESS_LEVELS,
    channels: CHANNELS,
    categories: ALERT_CATEGORIES,
  };
}
