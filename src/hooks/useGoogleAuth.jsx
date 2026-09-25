import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GOOGLE_CLIENT_IDS,
  isGoogleConfigured,
  loginWithGoogle,
  MISSING_CLIENT_ENV,
} from '../services/googleAuth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Cierra la ventana del navegador en cuanto Google devuelve el resultado
WebBrowser.maybeCompleteAuthSession();

// Entrar con Google: abre el consentimiento de Google, y con el access token
// que devuelve llama a POST /api/loginClient/google, que deja la cookie de
// sesión igual que el login con correo.
export function useGoogleAuth(navigation) {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // GOOGLE_CLIENT_IDS nunca trae huecos (ver googleAuth.js): esta llamada
  // revienta en el render si falta el clientId de la plataforma.
  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) {
        setLoading(false);
        toast.error('No se pudo entrar', 'Google no devolvió un token válido.');
        return;
      }
      loginWithGoogle(accessToken)
        .then(() => refreshUser())
        .then((client) => {
          toast.success('¡Bienvenido!', client?.name ? 'Entraste como ' + client.name : undefined);
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        })
        .catch((err) =>
          toast.error('No se pudo entrar con Google', err.message || 'Intenta de nuevo.')
        )
        .finally(() => setLoading(false));
      return;
    }

    setLoading(false);
    if (response.type === 'error') {
      toast.error('No se pudo entrar con Google', response.error?.message || 'Intenta de nuevo.');
    }
    // 'dismiss' y 'cancel' son que el usuario cerró la ventana: no hay nada que avisar
  }, [response]);

  const signIn = async () => {
    if (!isGoogleConfigured) {
      toast.warning(
        'Falta configurar Google',
        'Agrega ' + MISSING_CLIENT_ENV + ' en el archivo .env para habilitar esta opción.'
      );
      return;
    }
    setLoading(true);
    const result = await promptAsync();
    // Si ni siquiera se abrió la ventana, no dejamos el botón cargando
    if (!result || result.type !== 'success') setLoading(false);
  };

  return { signIn, loading, ready: !!request && isGoogleConfigured };
}
