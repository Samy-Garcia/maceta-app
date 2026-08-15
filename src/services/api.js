const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Error que trae el status HTTP para que las pantallas decidan qué mensaje mostrar
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Wrapper de fetch para hablar con la API de Macetas503 (maneja JSON y la cookie de sesión)
export async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(body?.message || 'Ocurrió un error inesperado.', response.status);
  }

  return body;
}
