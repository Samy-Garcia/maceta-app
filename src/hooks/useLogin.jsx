import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../services/api.js';

//  formulario de inicio de sesión
export function useLogin(navigation) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Completa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError('Correo o contraseña incorrectos.');
      } else if (err instanceof ApiError && err.status === 403) {
        setError('Tu cuenta se encuentra bloqueada.');
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => navigation.navigate('Register');
  const goToForgotPassword = () => navigation.navigate('ForgotPassword');
  const handleGoogleLogin = () => {};

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
    goToRegister,
    goToForgotPassword,
    handleGoogleLogin,
  };
}
