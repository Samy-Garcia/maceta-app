import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { PASSWORD_HINT, PASSWORD_REGEX } from '../utils/validators.js';

// establecer la nueva contraseña (POST /api/recoveryClient/newPassword)
export function useNewPassword(navigation) {
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
      await apiFetch('/api/recoveryClient/newPassword', {
        method: 'POST',
        body: JSON.stringify({ newPassword: password, confirmPassword }),
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
