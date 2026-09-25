import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useGoogleAuth } from './useGoogleAuth.jsx';

// verificación del código de 6 dígitos: sirve tanto para confirmar el registro
// (POST /api/registerClient/verifyCodeEmail) como para la recuperación de contraseña
// (POST /api/recoveryPasswordClient/verifyCode — el Swagger la documenta como
// /api/recoveryClient/verifyCode, pero el backend real usa ese otro nombre).
// El flujo llega por route.params.flow.
export function useVerification(navigation, params = {}) {
  const google = useGoogleAuth(navigation);
  const { flow = 'recovery', email = '' } = params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async () => {
    setError('');
    if (code.length < 6) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      if (flow === 'register') {
        await apiFetch('/api/registerClient/verifyCodeEmail', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        navigation.reset({ index: 0, routes: [{ name: 'Login', params: { registered: true } }] });
      } else {
        await apiFetch('/api/recoveryPasswordClient/verifyCode', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        navigation.navigate('NewPassword');
      }
    } catch (err) {
      setError(err.message || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = google.signIn;

  return { code, setCode, loading, error, handleVerifyCode, handleGoogleLogin, googleLoading: google.loading, flow, email };
}
