// Backend desplegado en Render, el mismo que documenta el .env. Se deja como
// respaldo porque EXPO_PUBLIC_API_URL solo existe si Metro llegó a leer el
// .env al arrancar: si se levanta desde otra carpeta, o el teléfono quedó con
// una build vieja, la variable llega undefined y todas las peticiones salían
// hacia "undefined/api/...". La variable sigue mandando cuando está presente,
// así que apuntar a un backend local sigue funcionando igual.
const FALLBACK_API_URL = 'https://macetas.onrender.com';
const API_URL = process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    '[api] EXPO_PUBLIC_API_URL no está definida; usando ' +
      FALLBACK_API_URL +
      '. Si querías otro backend, reinicia Metro con "npx expo start -c" desde la carpeta del proyecto.'
  );
}

// Error que trae el status HTTP para que las pantallas decidan qué mensaje mostrar
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const OFFLINE = 'Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.';

// Fallos de red de verdad. Se listan las formas en que los reporta cada
// plataforma para no mostrarle al cliente una excepción de Java: en Android
// un problema de DNS llega como "fetch failed: java.net.UnknownHostException:
// Unable to resolve host ... No address associated with hostname".
const NETWORK_ERROR = new RegExp(
  [
    'network request failed',
    'fetch failed',
    'failed to fetch',
    'unknownhost',
    'unable to resolve host',
    'no address associated',
    'enotfound',
    'econnrefused',
    'econnreset',
    'connection',
    'timeout',
    'timed out',
    'unreachable',
    'socket',
    'offline',
    'ssl',
  ].join('|'),
  'i'
);

// Wrapper de fetch para hablar con la API de Macetas503 (maneja JSON, FormData y la cookie de sesión).
//
// Todo pasa por el MISMO fetch a propósito: desde el SDK 56 el fetch global es
// expo/fetch, que corre sobre su propio módulo nativo con su propio cookie jar.
// Si una petición se mandara por XMLHttpRequest saldría sin la sesión. Para
// subir archivos, conviértelos antes a Blob (ver utils/fileToBlob.js): expo/fetch
// no sabe serializar las partes { uri, name, type } de React Native.
export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        // FormData necesita que la plataforma ponga su propio boundary en Content-Type
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch (err) {
    // Antes cualquier fallo se reportaba como falta de conexión y eso
    // escondía el error de verdad (por ejemplo, que el cuerpo no se pudo
    // serializar). Solo se llama "sin conexión" a lo que de verdad lo es.
    const detail = err?.message || err?.name || (err ? String(err) : '');
    const isNetwork = NETWORK_ERROR.test(detail);
    console.warn('[apiFetch] falló ' + (options.method || 'GET') + ' ' + path, err);
    throw new ApiError(
      isNetwork ? OFFLINE : 'Falló la petición: ' + (detail || 'el servidor no devolvió detalle'),
      0
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // La mayoría de endpoints devuelven { message }, pero /api/ruta (OSRM) usa { error }.
    // Cuando el servidor revienta responde HTML sin mensaje: ahí al menos se
    // muestra el código, que dice mucho más que "error inesperado".
    throw new ApiError(
      body?.message ||
        body?.error ||
        'El servidor respondió con un error ' + response.status + '.',
      response.status
    );
  }

  return body;
}
