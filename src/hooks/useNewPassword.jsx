import { useState } from 'react';

// establecer la nueva contraseña 
export function useNewPassword(navigation) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSavePassword = () => {
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login');
    }, 800);
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
