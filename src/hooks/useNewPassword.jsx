import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { PASSWORD_HINT, PASSWORD_REGEX } from '../utils/validators.js';
import { addLocalEvent } from '../services/notificationsStorage.js';
import { useAuth } from '../context/AuthContext.jsx';

// establecer la nueva contraseña (POST /api/recoveryPasswordClient/newPassword
// — el Swagger la documenta como /api/recoveryClient/newPassword, pero el
// backend real usa ese otro nombre)
export function useNewPassword(navigation) {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSavePassword = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Completa ambos campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/recoveryPasswordClient/newPassword', {
        method: 'POST',
        body: JSON.stringify({ newPassword: password, confirmPassword }),
      });
      // Queda como aviso en la bandeja: el backend no notifica estos cambios,
      // así que la app registra el evento en el propio dispositivo.
      await addLocalEvent(user?.email, {
        kind: 'seguridad',
        overline: 'CREDENCIALES',
        title: 'Contraseña actualizada',
        body: 'Tu contraseña se cambió desde esta aplicación. Si no reconoces esta acción, cámbiala de nuevo enseguida.',
        route: 'ForgotPassword',
        actionLabel: 'Revisar seguridad',
      });
      navigation.reset({ index: 0, routes: [{ name: 'Login', params: { passwordReset: true } }] });
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => navigation.navigate('Login');

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleSavePassword,
    goToLogin,
  };
}
