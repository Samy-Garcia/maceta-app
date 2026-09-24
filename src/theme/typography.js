import { Platform } from 'react-native';

// Serif de la marca: la usan el wordmark de la bienvenida y los títulos de
// las pantallas de autenticación. No hay fuente propia cargada en el proyecto,
// así que se toma la serif del sistema en cada plataforma.
export const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
