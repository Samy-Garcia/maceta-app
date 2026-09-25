// Nombre que se le muestra al cliente a cada tipo real del backend.
// 'otro' es como el backend guarda las demás piezas de concreto: hoy solo
// hay portavasos, si se agregan otras piezas conviene renombrar la etiqueta.
export const TYPE_LABEL = {
  maceta: 'Maceta',
  vela: 'Vela',
  planta: 'Planta',
  otro: 'Portavasos',
  combo: 'Combo',
};

export const typeLabel = (productType) => TYPE_LABEL[productType] || 'Pieza';
