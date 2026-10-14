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

// Igual que en la web: una planta nunca abre una ficha de producto para
// comprarla sola (no se vende por separado), abre su página de la guía de
// cuidados. Se usa en cualquier lugar donde se navega al tocar una tarjeta.
export const productRoute = (product) =>
  product.productType === 'planta'
    ? { name: 'PlantDetail', params: { product } }
    : { name: 'ProductDetail', params: { product } };
