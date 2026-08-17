import { useEffect, useState } from 'react';
import { fetchProductDetail } from '../services/products.js';
import { fetchProductReviews } from '../services/reviews.js';
import { favoriteKey, useProductActions } from './useProductActions.jsx';

// Trae el detalle completo de un producto real (la lista solo manda lo
// básico) y su calificación real calculada por el backend a partir de
// reseñas de verdad — nada de estrellas ni conteos inventados.
export function useProductDetail(navigation, routeParams = {}) {
  const summary = routeParams.product || {};
  const { favoriteIds, loadFavorites, toggleFavorite, addToCart: addToCartAction } = useProductActions();

  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadFavorites();
    if (!summary.id || !summary.productType) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetchProductDetail(summary.productType, summary.id),
      fetchProductReviews(summary.productType, summary.id).catch(() => ({ average: 0, count: 0 })),
    ])
      .then(([product, reviewData]) => {
        setDetail(product);
        setReviews(reviewData);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar el producto.'))
      .finally(() => setLoading(false));
  }, [summary.id, summary.productType]);

  const product = detail || summary;
  const stock = product.stock ?? summary.stock ?? 0;
  const images = detail?.images?.length ? detail.images.map((img) => img.url) : [product.image].filter(Boolean);
  const colorOptions = detail?.colorOptions || [];

  // Cada tipo de producto tiene sus propios campos reales: no se inventan
  // "material" ni datos que el modelo no tiene.
  const specs =
    summary.productType === 'vela'
      ? [
          { label: 'Tamaño', value: detail?.size },
          { label: 'Aroma', value: detail?.scent },
        ]
      : summary.productType === 'planta'
      ? [{ label: 'Tamaño', value: detail?.size }]
      : [
          { label: 'Dimensiones', value: detail?.dimensions },
          { label: 'Peso', value: detail?.weight },
        ];

  const aboutText = detail?.description || detail?.care || '';
  const aboutTitle = summary.productType === 'planta' ? 'Cuidados' : 'Sobre este producto';

  const increment = () => setQuantity((q) => Math.min(q + 1, stock || 1));
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    if (!stock) return;
    setAdding(true);
    try {
      await addToCartAction(
        { id: product.id || product._id, productType: summary.productType, name: product.name, stock },
        quantity
      );
    } finally {
      setAdding(false);
    }
  };

  return {
    product,
    stock,
    images,
    colorOptions,
    selectedImage,
    setSelectedImage,
    selectedColor,
    setSelectedColor,
    specs,
    aboutText,
    aboutTitle,
    rating: reviews,
    loading,
    error,
    quantity,
    increment,
    decrement,
    adding,
    isFavorite: favoriteIds.has(favoriteKey(summary.productType, product.id || product._id)),
    toggleFavorite: () => toggleFavorite({ id: product.id || product._id, productType: summary.productType }),
    handleAddToCart,
  };
}
