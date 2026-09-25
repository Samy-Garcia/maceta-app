import { Platform } from 'react-native';
import { apiFetch } from './api.js';

// Inicio de sesión con Google. El backend valida el access token contra
// Google y deja la misma cookie de sesión que el login normal, así que a
// partir de aquí todo el resto de la app funciona igual.
// Campo exacto que espera el backend: { accessToken }.
export const loginWithGoogle = (accessToken) =>
  apiFetch('/api/loginClient/google', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  });

// IDs de cliente OAuth. Se leen del .env para no dejarlos escritos en el
// código: son los que se crean en Google Cloud Console, uno por plataforma.
const CONFIGURED = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
};

// Cada plataforma exige el suyo: de nada sirve tener solo el de Web si la
// app corre en Android.
const PLATFORM_KEY = Platform.select({
  android: 'androidClientId',
  ios: 'iosClientId',
  default: 'webClientId',
});

export const MISSING_CLIENT_ENV = Platform.select({
  android: 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
  ios: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  default: 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
});

export const isGoogleConfigured = !!CONFIGURED[PLATFORM_KEY];

// expo-auth-session lanza un error EN EL RENDER si falta el clientId de la
// plataforma actual, así que nunca se le pasa un hueco: lo que no esté
// configurado va con un relleno que jamás se llega a usar, porque el botón
// avisa antes de abrir nada.
const PLACEHOLDER = 'google-sin-configurar.apps.googleusercontent.com';

export const GOOGLE_CLIENT_IDS = {
  webClientId: CONFIGURED.webClientId || PLACEHOLDER,
  androidClientId: CONFIGURED.androidClientId || PLACEHOLDER,
  iosClientId: CONFIGURED.iosClientId || PLACEHOLDER,
};
