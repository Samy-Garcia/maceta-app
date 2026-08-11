import { useEffect, useState } from 'react';

// es el tiempo de la pantalla de cargaantes de ir a Login
export function useSplashLoader(duration = 1800) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return { isReady };
}
