import { apiFetch } from './api.js';

// Integración real de Wompi, calcada del checkout que ya corre en producción
// en la web (inspeccionado directo del bundle de https://macetas-cfqv.vercel.app/
// porque la copia local del backend estaba desactualizada). El backend tokeniza
// y cobra en modo de PRUEBA: no se hace ningún cobro real a la tarjeta, pero el
// flujo — token de acceso, tokenizar tarjeta, cobrar — es el mismo que usaría
// en producción si algún día se activan las llaves reales de Wompi.
//
// El cliente solo puede tener UNA tarjeta guardada a la vez (lo guarda el
// backend en su propia cuenta, no el teléfono): para "cambiarla" primero hay
// que eliminar la actual y agregar la nueva.

const getAccessToken = () =>
  apiFetch('/api/wompi/token', { method: 'POST' }).then((r) => r.access_token);

const tokenizeCard = ({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }) =>
  apiFetch('/api/wompi/tokenizarTarjeta', {
    method: 'POST',
    body: JSON.stringify({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }),
  });

// Cobra con una tarjeta nueva: tokeniza primero (necesita su propio token de
// acceso) y pide un segundo token de acceso para el cobro, igual que la web.
export async function payWithNewCard({
  numeroTarjeta,
  cvv,
  mesVencimiento,
  anioVencimiento,
  nombreEnTarjeta,
  monto,
  emailCliente,
  nombreCliente,
}) {
  const tokenForCard = await getAccessToken();
  const { token: tokenTarjeta } = await tokenizeCard({
    token: tokenForCard,
    numeroTarjeta,
    cvv,
    mesVencimiento,
    anioVencimiento,
    nombreEnTarjeta,
  });
  const tokenForPayment = await getAccessToken();
  return apiFetch('/api/wompi/paymentTest', {
    method: 'POST',
    body: JSON.stringify({
      token: tokenForPayment,
      formData: { tokenTarjeta, monto, emailCliente, nombreCliente },
    }),
  });
}

// Cobra con la tarjeta que el cliente ya tiene guardada en su cuenta: el
// backend busca el token guardado, no hace falta mandar datos de tarjeta.
export const payWithSavedCard = ({ monto, emailCliente, nombreCliente }) =>
  apiFetch('/api/wompi/pagarConTarjetaGuardada', {
    method: 'POST',
    body: JSON.stringify({ monto, emailCliente, nombreCliente }),
  });

// Convierte la respuesta cruda del backend (esAprobada/idTransaccion/...) a
// algo más legible para las pantallas.
export const normalizeWompiResult = (result) =>
  result
    ? {
        approved: !!result.esAprobada,
        transactionId: result.idTransaccion,
        authCode: result.codigoAutorizacion,
        message: result.mensaje,
      }
    : { approved: false, message: 'Sin respuesta del servidor.' };

// Guarda una tarjeta en la cuenta del cliente (reemplaza la que hubiera).
export const saveWompiCard = ({ numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }) =>
  apiFetch('/api/loginClient/me/payment-method', {
    method: 'POST',
    body: JSON.stringify({ numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }),
  });

export const deleteWompiCard = () =>
  apiFetch('/api/loginClient/me/payment-method', { method: 'DELETE' });

// "MM/AA" -> { mesVencimiento, anioVencimiento } con el año en 4 dígitos.
// Misma conversión que usa el formulario de la web (si el año viene en 2
// dígitos le antepone "20").
export function parseExpiry(expiry) {
  const [month, year] = (expiry || '').split('/');
  const mesVencimiento = Number(month);
  const anioVencimiento = Number(year?.length === 2 ? `20${year}` : year);
  return { mesVencimiento, anioVencimiento };
}
