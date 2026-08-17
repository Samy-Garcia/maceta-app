import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { EMAIL_REGEX } from '../utils/validators.js';

// recuperación de contraseña: pide el código (POST /api/recoveryPasswordClient)
// El Swagger documenta esta ruta como /api/recoveryClient, pero en app.js del
// backend está montada como /api/recoveryPasswordClient — mismo tipo de
// desajuste que /api/posts vs /api/post o /api/route vs /api/ruta.
export function useForgotPassword(navigation) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setError('');
    if (!email) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/recoveryPasswordClient', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      navigation.navigate('Verification', { flow: 'recovery', email: email.trim() });
    } catch (err) {
      setError(err.message || 'No se pudo enviar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {};

  return { email, setEmail, loading, error, handleSendCode, handleGoogleLogin };
}
