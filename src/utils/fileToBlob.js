// Convierte un archivo local (el file:// que devuelve el selector de imágenes)
// en un Blob, que es lo que sí sabe serializar el fetch de Expo.
//
// Desde el SDK 56 el fetch global es expo/fetch, y NO entiende las partes
// { uri, name, type } de React Native: lanza "Unsupported FormDataPart
// implementation". Tampoco sirve mandar la subida por XMLHttpRequest para
// esquivarlo, porque esa es otra pila de red con otro cookie jar y la
// petición saldría sin la sesión del cliente.
//
// Leer el archivo local sí se hace con XHR: ahí no hace falta sesión.
// Cada fallo rechaza con un Error con mensaje propio, para que si algo se
// rompe la pantalla pueda decir en qué paso fue y no "revisa tu conexión".
export function uriToBlob(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';

    xhr.onload = () => {
      const blob = xhr.response;
      if (!blob || typeof blob.size !== 'number') {
        reject(new Error('La imagen seleccionada se leyó vacía.'));
        return;
      }
      if (blob.size === 0) {
        reject(new Error('La imagen seleccionada está vacía (0 bytes).'));
        return;
      }
      resolve(blob);
    };
    xhr.onerror = () => reject(new Error('No se pudo abrir la imagen seleccionada.'));
    xhr.ontimeout = () => reject(new Error('Tardó demasiado en leerse la imagen.'));

    try {
      xhr.open('GET', uri);
      xhr.send();
    } catch (err) {
      reject(new Error('No se pudo leer la imagen: ' + (err?.message || 'error desconocido')));
    }
  });
}

// Deja el Blob listo para subirlo, con el tipo correcto: el que adivina el
// lector a veces viene vacío y el backend filtra por mimetype.
export async function fileToUploadBlob(uri, mimeType) {
  const raw = await uriToBlob(uri);
  if (!mimeType || raw.type === mimeType) return raw;

  try {
    return new Blob([raw], { type: mimeType });
  } catch {
    // Si esta plataforma no permite recomponer el Blob, se sube tal cual
    return raw;
  }
}
