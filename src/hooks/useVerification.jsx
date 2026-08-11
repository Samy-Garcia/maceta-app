import { useState } from 'react';

//verificación del código
export function useVerification(navigation) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = () => {
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('NewPassword');
    }, 800);
  };

  const handleGoogleLogin = () => {};

  return { code, setCode, loading, handleVerifyCode, handleGoogleLogin };
}
