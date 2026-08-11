import { useState } from 'react';

//recuperación de contraseña
export function useForgotPassword(navigation) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Verification');
    }, 800);
  };

  const handleGoogleLogin = () => {};

  return { email, setEmail, loading, handleSendCode, handleGoogleLogin };
}
