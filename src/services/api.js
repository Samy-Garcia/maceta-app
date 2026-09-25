const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Error que trae el status HTTP para que las pantallas decidan qué mensaje mostrar
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const OFFLINE = 'No se pudo conectar con el servidor. Verifica tu conexión.';

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
    const isNetwork = /network request failed|failed to fetch|connection|timeout|unreachable|socket/i.test(
      detail
    );
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
