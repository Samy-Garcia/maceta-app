import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useProductDetail } from '../hooks/useProductDetail.jsx';
import { useStoreConfig } from '../hooks/useStoreConfig.jsx';
import { TYPE_LABEL } from '../utils/productTypes.js';
import { formatOrderDate } from '../utils/orderStatus.js';

export default function ProductDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const { freeShippingFrom } = useStoreConfig();
  const productType = route?.params?.product?.productType;
  const [openSection, setOpenSection] = useState('about');
  const {
    product, stock, images, colorOptions, sizes,
    selectedImage, setSelectedImage, selectedColor, setSelectedColor, selectedSize, setSelectedSize,
    specs, aboutText, aboutTitle, rating, reviewList, related, comboItems,
    basePrice, unitPrice, total,
    loading, error, quantity, increment, decrement,
    adding, isFavorite, toggleFavorite, handleAddToCart, openRelated,
  } = useProductDetail(navigation, route?.params);

  const galleryWidth = width - 32;
  const visibleSpecs = specs.filter((spec) => spec.value);
  const hasDiscount = unitPrice < basePrice;

  const sections = [
    { key: 'about', title: aboutTitle, icon: 'leaf-outline', body: aboutText },
    visibleSpecs.length > 0
      ? { key: 'specs', title: 'Dimensiones & Peso', icon: 'resize-outline', specs: visibleSpecs }
      : null,
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TYPE_LABEL[productType] || 'Producto'}</Text>
        <TouchableOpacity onPress={toggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.maroon : colors.text}
          />
        </TouchableOpacity>
      </View>

      {freeShippingFrom != null ? (
        <View style={styles.shippingStrip}>
          <Ionicons name="car-outline" size={14} color={colors.primary} />
          <Text style={styles.shippingText}>
            Envío gratis en órdenes mayores a ${freeShippingFrom.toFixed(2)}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.gallery, { width: galleryWidth, height: galleryWidth * 0.92 }]}>
            {images[selectedImage] ? (
              <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} resizeMode="cover" />
            ) : (
              <View style={styles.mainFallback}>
                <Ionicons name="leaf-outline" size={48} color={colors.placeholder} />
              </View>
            )}
            {hasDiscount ? (
              <View style={styles.galleryTag}>
                <Text style={styles.galleryTagText}>
                  -{Math.round(((basePrice - unitPrice) / basePrice) * 100)}% OFF
                </Text>
              </View>
            ) : null}
          </View>

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
              <Text style={styles.overline}>{(TYPE_LABEL[productType] || 'Pieza').toUpperCase()}</Text>
              {rating.count > 0 ? (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#E8A33D" />
                  <Text style={styles.ratingText}>
                    {rating.average.toFixed(1)} ({rating.count})
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>${unitPrice.toFixed(2)}</Text>
              {hasDiscount ? <Text style={styles.priceOld}>${basePrice.toFixed(2)}</Text> : null}
              <View style={[styles.stockPill, !stock && styles.stockPillOut]}>
                <Text style={[styles.stockPillText, !stock && styles.stockPillTextOut]}>
                  {stock > 0 ? 'En stock · ' + stock + ' disponibles' : 'Sin stock'}
                </Text>
              </View>
            </View>

            {aboutText ? <Text style={styles.intro}>{aboutText}</Text> : null}

            {colorOptions.length > 0 ? (
              <>
                <View style={styles.optionHead}>
                  <Text style={styles.optionTitle}>Color</Text>
                  <Text style={styles.optionValue}>{colorOptions[selectedColor]?.name}</Text>
                </View>
                <View style={styles.colorsRow}>
                  {colorOptions.map((color, index) => (
                    <TouchableOpacity
                      key={color.name + index}
                      onPress={() => setSelectedColor(index)}
                      style={[styles.swatchRing, index === selectedColor && styles.swatchRingActive]}
                    >
                      <View style={[styles.swatch, { backgroundColor: color.hex }]} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            {sizes.length > 0 ? (
              <>
                <View style={styles.optionHead}>
                  <Text style={styles.optionTitle}>Tamaño</Text>
                </View>
                <View style={styles.sizesRow}>
                  {sizes.map((size, index) => {
                    const active = index === selectedSize;
                    return (
                      <TouchableOpacity
                        key={size + index}
                        style={[styles.sizeOption, active && styles.sizeOptionActive]}
                        onPress={() => setSelectedSize(index)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.sizeOptionText, active && styles.sizeOptionTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}

            {comboItems.length > 0 ? (
              <View style={styles.comboBox}>
                <Text style={styles.comboTitle}>Este set incluye</Text>
                {comboItems.map((item) => (
                  <View key={item.productId} style={styles.comboRow}>
                    <Ionicons name="ellipse" size={5} color={colors.primary} />
                    <Text style={styles.comboText}>
                      {item.productName}
                      {item.quantity > 1 ? ' ×' + item.quantity : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {sections.map((section) => {
              const open = openSection === section.key;
              return (
                <View key={section.key} style={styles.accordion}>
                  <TouchableOpacity
                    style={styles.accordionHead}
                    onPress={() => setOpenSection(open ? null : section.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={section.icon} size={16} color={colors.primary} />
                    <Text style={styles.accordionTitle}>{section.title}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.placeholder}
                    />
                  </TouchableOpacity>

                  {open ? (
                    <View style={styles.accordionBody}>
                      {section.body ? <Text style={styles.accordionText}>{section.body}</Text> : null}
                      {section.specs
                        ? section.specs.map((spec) => (
                            <View key={spec.label} style={styles.specRow}>
                              <Text style={styles.specLabel}>{spec.label}</Text>
                              <Text style={styles.specValue}>{spec.value}</Text>
                            </View>
                          ))
                        : null}
                    </View>
                  ) : null}
                </View>
              );
            })}

            {reviewList.length > 0 ? (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Experiencia del Cliente</Text>
                  <Text style={styles.sectionCount}>
                    {rating.count} opinion{rating.count === 1 ? '' : 'es'}
                  </Text>
                </View>

                {reviewList.map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHead}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewInitials}>
                          {review.clientName?.trim()?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.reviewWho}>
                        <Text style={styles.reviewName} numberOfLines={1}>{review.clientName}</Text>
                        <Text style={styles.reviewDate}>{formatOrderDate(review.createdAt)}</Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Ionicons
                            key={index}
                            name={index < review.rating ? 'star' : 'star-outline'}
                            size={11}
                            color="#E8A33D"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{review.comment}</Text>
                    {review.isCustomized ? (
                      <Text style={styles.reviewCustom}>Pieza personalizada</Text>
                    ) : null}
                  </View>
                ))}
              </>
            ) : null}

            {related.length > 0 ? (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Combina a la Perfección</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedRow}>
                  {related.map((item) => (
                    <TouchableOpacity
                      key={item.productType + '-' + item.id}
                      style={styles.relatedCard}
                      activeOpacity={0.85}
                      onPress={() => openRelated(item)}
                    >
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.relatedImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.relatedImage, styles.relatedFallback]}>
                          <Ionicons name="leaf-outline" size={22} color={colors.placeholder} />
                        </View>
                      )}
                      <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.relatedPrice}>${(item.price || 0).toFixed(2)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </View>
        </ScrollView>
      )}

      {!loading && !error ? (
        <View style={styles.footer}>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperButton} onPress={decrement}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={increment}>
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addButton, !stock && styles.addButtonDisabled]}
            onPress={handleAddToCart}
            disabled={!stock || adding}
            activeOpacity={0.85}
          >
            {adding ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="bag-add-outline" size={17} color={colors.white} />
                <Text style={styles.addButtonText}>
                  {stock > 0 ? 'Añadir a la Cesta' : 'Sin stock'}
                </Text>
                {stock > 0 ? <Text style={styles.addButtonPrice}>${total.toFixed(2)}</Text> : null}
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerTitle: { fontSize: 12, letterSpacing: 2.2, fontWeight: '700', color: colors.placeholder },

    shippingStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    shippingText: { fontSize: 11.5, fontWeight: '600', color: colors.primary, marginLeft: 7 },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    errorText: { fontSize: 13, color: colors.placeholder, textAlign: 'center' },

    content: { paddingBottom: 24 },

    gallery: {
      alignSelf: 'center',
      marginTop: 14,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    mainImage: { width: '100%', height: '100%' },
    mainFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    galleryTag: {
      position: 'absolute',
      top: 14,
      left: 14,
      backgroundColor: colors.maroon,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    galleryTagText: { fontSize: 10, fontWeight: '700', color: colors.white },

    thumbRow: { paddingLeft: 16, marginTop: 12 },
    thumb: {
      width: 62,
      height: 62,
      borderRadius: 14,
      marginRight: 10,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: colors.card,
    },
    thumbActive: { borderColor: colors.primary },

    body: { paddingHorizontal: 20, paddingTop: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    overline: { fontSize: 9, letterSpacing: 1.6, fontWeight: '700', color: colors.maroon },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 },
    name: { fontFamily: SERIF, fontSize: 25, fontWeight: '700', color: colors.text, marginTop: 8 },

    priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
    price: { fontSize: 22, fontWeight: '700', color: colors.text },
    priceOld: {
      fontSize: 14,
      color: colors.placeholder,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    stockPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginLeft: 10,
    },
    stockPillOut: { backgroundColor: isDark ? colors.card : '#F1E7E7' },
    stockPillText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    stockPillTextOut: { color: colors.maroon },

    intro: { fontSize: 13.5, lineHeight: 20, color: colors.text, marginTop: 14 },

    optionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    optionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    optionValue: { fontSize: 12, color: colors.placeholder },
    colorsRow: { flexDirection: 'row', marginTop: 12 },
    swatchRing: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchRingActive: { borderColor: colors.primary },
    swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border },

    sizesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
    sizeOption: {
      paddingHorizontal: 18,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      marginBottom: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    sizeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sizeOptionText: { fontSize: 13, fontWeight: '700', color: colors.text },
    sizeOptionTextActive: { color: colors.white },

    comboBox: {
      marginTop: 22,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    comboTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
    comboRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    comboText: { fontSize: 12.5, color: colors.text, marginLeft: 8 },

    accordion: {
      marginTop: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
      overflow: 'hidden',
    },
    accordionHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52 },
    accordionTitle: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.text, marginLeft: 10 },
    accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
    accordionText: { fontSize: 13, lineHeight: 19, color: colors.text },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    specLabel: { fontSize: 12.5, color: colors.placeholder },
    specValue: { fontSize: 12.5, fontWeight: '700', color: colors.text },

    sectionHead: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: 28,
      marginBottom: 12,
    },
    sectionTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    sectionCount: { fontSize: 12, color: colors.placeholder },

    reviewCard: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    reviewHead: { flexDirection: 'row', alignItems: 'center' },
    reviewAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewInitials: { fontSize: 14, fontWeight: '700', color: colors.primary },
    reviewWho: { flex: 1, marginHorizontal: 10 },
    reviewName: { fontSize: 13, fontWeight: '700', color: colors.text },
    reviewDate: { fontSize: 11, color: colors.placeholder, marginTop: 1 },
    reviewStars: { flexDirection: 'row' },
    reviewText: { fontSize: 13, lineHeight: 19, color: colors.text, marginTop: 10, fontStyle: 'italic' },
    reviewCustom: { fontSize: 11, fontWeight: '700', color: colors.maroon, marginTop: 8 },

    relatedRow: { overflow: 'visible' },
    relatedCard: { width: 140, marginRight: 12 },
    relatedImage: { width: 140, height: 130, borderRadius: 16, backgroundColor: colors.card },
    relatedFallback: { alignItems: 'center', justifyContent: 'center' },
    relatedName: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginTop: 8 },
    relatedPrice: { fontSize: 12.5, color: colors.placeholder, marginTop: 3 },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: isDark ? colors.card : colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      paddingHorizontal: 4,
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    stepperButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { width: 22, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.text },
    addButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
    },
    addButtonDisabled: { opacity: 0.45 },
    addButtonText: { fontSize: 14, fontWeight: '700', color: colors.white, marginLeft: 8 },
    addButtonPrice: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginLeft: 10 },
  });
