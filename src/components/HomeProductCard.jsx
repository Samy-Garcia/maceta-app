import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext.jsx';

// Tarjeta de producto de la portada. "carousel" es la de Más Vendidos (ancho
// fijo, se desliza) y "grid" la de Novedades (dos columnas).
export default function HomeProductCard({
  product,
  variant = 'grid',
  overline,
  badge,
  specs,
  isFavorite,
  onPress,
  onToggleFavorite,
  onAdd,
}) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const isCarousel = variant === 'carousel';

  // Los números se normalizan aquí porque a esta tarjeta le llegan productos
  // de varias fuentes (catálogo, ofertas, más vendidos) y alguna puede traer
  // el precio o la calificación vacíos. Antes eso reventaba la pantalla
  // entera con "Cannot read property 'toFixed' of undefined".
  const basePrice = Number(product.price) || 0;
  const discounted = Number(product.discountedPrice);
  const hasDiscount = Number.isFinite(discounted) && discounted > 0 && discounted < basePrice;
  const price = hasDiscount ? discounted : basePrice;
  const rating = Number(product.rating) || 0;

  return (
    <TouchableOpacity
      style={[styles.card, isCarousel ? styles.cardCarousel : styles.cardGrid]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.imageBox, isCarousel ? styles.imageCarousel : styles.imageGrid]}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="leaf-outline" size={26} color={colors.placeholder} />
        )}

        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}

        {product.reviewCount ? (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={9} color="#E8A33D" />
            <Text style={styles.ratingPillText}>
              {rating.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.heart}
          onPress={onToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={15}
            color={isFavorite ? colors.maroon : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {overline ? <Text style={styles.overline}>{overline}</Text> : null}
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        {specs ? <Text style={styles.specs} numberOfLines={1}>{specs}</Text> : null}

        <View style={styles.footer}>
          <View style={styles.priceBox}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            {hasDiscount ? (
              <Text style={styles.priceOld}>${basePrice.toFixed(2)}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.add, !product.stock && styles.addDisabled]}
            onPress={onAdd}
            disabled={!product.stock}
          >
            <Ionicons name="add" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardCarousel: { width: 176, marginRight: 12 },
    cardGrid: { width: '48%', marginBottom: 14 },
    imageBox: {
      width: '100%',
      backgroundColor: isDark ? colors.card : '#EFF2EF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageCarousel: { height: 178 },
    imageGrid: { height: 132 },
    image: { width: '100%', height: '100%' },
    badge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    badgeText: { fontSize: 10, fontWeight: '700', color: colors.text },
    ratingPill: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    ratingPillText: { fontSize: 10, fontWeight: '700', color: colors.text, marginLeft: 3 },
    heart: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 },
    overline: {
      fontSize: 9,
      letterSpacing: 1.1,
      fontWeight: '700',
      color: colors.placeholder,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    name: { fontSize: 14, fontWeight: '700', color: colors.text },
    specs: { fontSize: 11, color: colors.placeholder, marginTop: 3 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    priceBox: { flexDirection: 'row', alignItems: 'baseline', flex: 1 },
    price: { fontSize: 15, fontWeight: '700', color: colors.text },
    priceOld: {
      fontSize: 11,
      color: colors.placeholder,
      textDecorationLine: 'line-through',
      marginLeft: 5,
    },
    add: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addDisabled: { opacity: 0.35 },
  });
