import {
  ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useProductDetail } from '../hooks/useProductDetail.jsx';

const TYPE_LABELS = { maceta: 'Maceta', vela: 'Vela', planta: 'Planta' };

export default function ProductDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { itemCount } = useCart();
  const {
    product, stock, images, colorOptions, selectedImage, setSelectedImage, selectedColor, setSelectedColor,
    specs, aboutText, aboutTitle, rating, loading, error, quantity, increment, decrement,
    adding, isFavorite, toggleFavorite, handleAddToCart,
  } = useProductDetail(navigation, route?.params);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TYPE_LABELS[route?.params?.product?.productType] || 'Producto'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={22} color={colors.white} />
          {itemCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {images[selectedImage] ? (
            <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} resizeMode="cover" />
          ) : (
            <View style={[styles.mainImage, styles.mainImageFallback]}>
              <Ionicons name="leaf-outline" size={48} color={colors.placeholder} />
            </View>
          )}

          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {images.map((uri, index) => (
                <TouchableOpacity key={uri + index} onPress={() => setSelectedImage(index)}>
                  <Image
                    source={{ uri }}
                    style={[styles.thumb, index === selectedImage && styles.thumbActive]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{product.name}</Text>
              <TouchableOpacity onPress={toggleFavorite}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={colors.maroon} />
              </TouchableOpacity>
            </View>

            {rating.count > 0 ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.maroon} />
                <Text style={styles.ratingText}>
                  {rating.average.toFixed(1)} ({rating.count} reseña{rating.count === 1 ? '' : 's'})
                </Text>
              </View>
            ) : (
              <Text style={styles.noRating}>Todavía no tiene reseñas</Text>
            )}

            <Text style={styles.price}>$ {(product.price || 0).toFixed(2)}</Text>

            <View style={styles.specsRow}>
              {specs.filter((s) => s.value).map((spec) => (
                <View key={spec.label} style={styles.specCard}>
                  <Text style={styles.specLabel}>{spec.label.toUpperCase()}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>

            {colorOptions.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Colores</Text>
                <View style={styles.colorsRow}>
                  {colorOptions.map((c, index) => (
                    <TouchableOpacity
                      key={c.name + index}
                      onPress={() => setSelectedColor(index)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c.hex },
                        index === selectedColor && styles.colorSwatchActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {aboutText ? (
              <>
                <Text style={styles.sectionTitle}>{aboutTitle}</Text>
                <Text style={styles.aboutText}>{aboutText}</Text>
              </>
            ) : null}

            <Text style={styles.stockText}>
              {stock > 0 ? `${stock} disponibles` : 'Sin stock por ahora'}
            </Text>
          </View>
        </ScrollView>
      )}

      {!loading && !error ? (
        <View style={styles.footer}>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperButton} onPress={decrement}>
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={increment}>
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.addButtonWrapper}>
            <Button
              label={stock > 0 ? 'Añadir al Carrito' : 'Sin stock'}
              icon="cart"
              onPress={handleAddToCart}
              disabled={!stock}
              loading={adding}
            />
          </View>
        </View>
      ) : null}

      <BottomTabBar active="Productos" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    cartButton: { position: 'relative' },
    cartBadge: {
      position: 'absolute', top: -6, right: -8, backgroundColor: colors.maroon, borderRadius: 8,
      minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    },
    cartBadgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: 13, color: colors.maroonDark, textAlign: 'center', paddingHorizontal: 20 },
    content: { paddingBottom: 20 },
    mainImage: { width: '100%', height: 300, backgroundColor: colors.border },
    mainImageFallback: { alignItems: 'center', justifyContent: 'center' },
    thumbRow: { marginTop: -28, paddingLeft: 20 },
    thumb: {
      width: 56, height: 56, borderRadius: 10, marginRight: 10,
      borderWidth: 2, borderColor: colors.surface,
    },
    thumbActive: { borderColor: colors.maroon },
    body: { padding: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    name: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text, marginRight: 12 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    ratingText: { fontSize: 13, color: colors.placeholder, marginLeft: 6 },
    noRating: { fontSize: 12, color: colors.placeholder, marginTop: 6 },
    price: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 10 },
    specsRow: { flexDirection: 'row', marginTop: 16 },
    specCard: {
      flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 12,
      alignItems: 'center', marginRight: 10,
    },
    specLabel: { fontSize: 10, color: colors.placeholder, fontWeight: '700', letterSpacing: 0.5 },
    specValue: { fontSize: 14, color: colors.text, fontWeight: '700', marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.placeholder, marginTop: 22, letterSpacing: 0.5 },
    colorsRow: { flexDirection: 'row', marginTop: 10 },
    colorSwatch: { width: 32, height: 32, borderRadius: 16, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
    colorSwatchActive: { borderColor: colors.maroon },
    aboutText: { fontSize: 13, color: colors.text, lineHeight: 20, marginTop: 8 },
    stockText: { fontSize: 12, color: colors.placeholder, marginTop: 16 },
    footer: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
      borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background,
    },
    stepper: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft,
      borderRadius: 12, paddingHorizontal: 6, height: 48, marginRight: 12,
    },
    stepperButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { width: 24, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.text },
    addButtonWrapper: { flex: 1 },
  });
