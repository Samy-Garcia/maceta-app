const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

// Los cinco catálogos (Post=maceta, Candle=vela, Plant=planta, Other=otro,
// Combo=combo) tienen campos distintos; esto los reduce a la forma común que
// usa la grilla de productos.
export function normalizeProduct(item, productType) {
  return {
    id: item._id,
    name: item.name,
    image: item.image,
    price: item.price,
    stock: item.stock,
    dimensions: item.dimensions || item.size || '',
    // Las plantas guardan su texto en 'care' en vez de 'description'
    description: item.description || item.care || '',
    // Las plantas separan sus cuidados en 4 categorías reales del backend
    // (antes era un solo bloque de texto); se guardan aparte para la guía.
    careLight: item.careLight || '',
    careWater: item.careWater || '',
    careSoil: item.careSoil || '',
    careTemperature: item.careTemperature || '',
    productType,
    createdAt: item.createdAt,
    sold: item.sold,
    // El backend ya calcula la calificación real de cada producto
    rating: item.rating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    // variantes reales que ofrece el producto (para los filtros de Tamaño/Color)
    sizes: item.sizes?.length ? item.sizes : [item.size].filter(Boolean),
    colorOptions: item.colorOptions || [],
    // Solo los combos: los productos que trae el set
    items: item.items || [],
  };
}

export function offerKey(productType, productId) {
  return `${productType}:${productId}`;
}

export function buildOffersMap(offers) {
  const map = {};
  for (const offer of offers) {
    if (offer.status === false) continue;
    map[offerKey(offer.productType, offer.productId)] = offer;
  }
  return map;
}

export function applyOffer(product, offersMap) {
  const offer = offersMap[offerKey(product.productType, product.id)];
  if (!offer) return product;
  return {
    ...product,
    discountedPrice: offer.discountedPrice,
    discountPercentage: offer.discountPercentage,
  };
}

export function isRecentlyAdded(product) {
  if (!product.createdAt) return false;
  return Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_MS;
}
