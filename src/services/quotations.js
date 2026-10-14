import { apiFetch } from './api.js';

// Cotizaciones para eventos: calcado del flujo real de la web
// (/cotizaciones y /mis-cotizaciones), que ya corre en producción.
export const fetchMyQuotations = () => apiFetch('/api/quotations/mine');

export const createQuotation = ({
  eventType,
  eventDate,
  guestCount,
  location,
  locationLat,
  locationLng,
  specialRequirements,
  items,
}) =>
  apiFetch('/api/quotations', {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      eventDate,
      guestCount,
      location,
      locationLat,
      locationLng,
      specialRequirements,
      items,
    }),
  });
