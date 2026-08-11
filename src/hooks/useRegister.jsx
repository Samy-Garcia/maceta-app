import { useState } from 'react';

// formulario de creación de cuenta 
export function useRegister(navigation) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login');
    }, 800);
  };

  const goToLogin = () => navigation.navigate('Login');
  const handleGoogleRegister = () => {};

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    goToLogin,
    handleGoogleRegister,
  };
}
