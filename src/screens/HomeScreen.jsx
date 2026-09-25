import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import ShopHeader from '../components/ShopHeader.jsx';
import HomeProductCard from '../components/HomeProductCard.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useHome } from '../hooks/useHome.jsx';
import { TYPE_LABEL } from '../utils/productTypes.js';
import { favoriteKey } from '../hooks/useProductActions.jsx';
import { isRecentlyAdded } from '../utils/normalizeProduct.js';

const SOCIAL_CHANNELS = [
  { key: 'instagram', label: 'Instagram', hint: 'Novedades', icon: 'logo-instagram' },
  { key: 'facebook', label: 'Facebook', hint: 'Comunidad', icon: 'logo-facebook' },
  { key: 'tiktok', label: 'TikTok', hint: 'Videos', icon: 'logo-tiktok' },
];

const TRUST = [
  { icon: 'leaf-outline', label: '100% Artesanal' },
  { icon: 'shield-checkmark-outline', label: 'Garantía 30 días' },
  { icon: 'cube-outline', label: 'Empaque Seguro' },
];

// Cuánto hace que se escribió una reseña, en palabras
function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  if (days < 30) return 'Hace ' + days + ' días';
  const months = Math.floor(days / 30);
  return months === 1 ? 'Hace 1 mes' : 'Hace ' + months + ' meses';
}

// Portada de la tienda: lo mismo que muestra la web — anuncio, envío gratis,
// promociones activas, más vendidos, novedades, reseñas reales de clientes
// y el programa de lealtad.
export default function HomeScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const {
    announcement, freeShippingFrom, socialMedia, heroImages,
    categories, category, setCategory,
    promos, bestsellers, newArrivals, community, rating,
    loyaltyPoints,
    loading, error, retry,
    favoriteIds, toggleFavorite, addToCart,
  } = useHome();

  const heroWidth = width - 40;
  const openSearch = () =>
    navigation.navigate('Products', search.trim() ? { query: search.trim() } : undefined);
  const openProduct = (product) => navigation.navigate('ProductDetail', { product });
  const isFavorite = (item) => favoriteIds.has(favoriteKey(item.productType, item.id));

  // Cada catálogo tiene sus propios datos: las macetas traen dimensiones, los
  // más vendidos traen unidades vendidas y el resto al menos su stock real.
  const specsOf = (item) => {
    if (item.dimensions) return item.dimensions;
    if (item.sold) return item.sold + ' vendidos';
    return item.stock + ' en stock';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ShopHeader />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.placeholder} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={openSearch}
            returnKeyType="search"
            placeholder="Buscar plantas, macetas artesanales..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Products')}>
          <Ionicons name="options-outline" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {announcement ? (
          <View style={styles.announcement}>
            <Ionicons name="megaphone-outline" size={13} color={colors.primary} />
            <Text style={styles.announcementText} numberOfLines={1}>{announcement}</Text>
          </View>
        ) : null}

        {freeShippingFrom != null ? (
          <View style={styles.shippingStrip}>
            <View style={styles.shippingDot} />
            <Text style={styles.shippingText}>
              Envío gratis en compras mayores a ${freeShippingFrom.toFixed(2)}
            </Text>
            <Ionicons name="car-outline" size={15} color={colors.placeholder} />
          </View>
        ) : null}

        <Text style={styles.greeting}>Hola, {user?.name || 'bienvenido'}</Text>
        <Text style={styles.greetingSub}>
          Descubre piezas botánicas en arcilla cruda y concreto mineral.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((item) => {
            const active = item.key === category;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(item.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={retry}>
              <Text style={styles.errorRetry}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {promos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={heroWidth + 12}
            decelerationRate="fast"
          >
            {promos.map((promo) => (
              <TouchableOpacity
                key={promo.offerId}
                style={[styles.hero, { width: heroWidth }]}
                activeOpacity={0.9}
                onPress={() => openProduct(promo)}
              >
                {promo.image ? (
                  <Image source={{ uri: promo.image }} style={styles.heroImage} resizeMode="cover" />
                ) : null}
                <View style={styles.heroShade} />

                <View style={styles.heroTag}>
                  <View style={styles.heroTagDot} />
                  <Text style={styles.heroTagText}>NUEVO LANZAMIENTO</Text>
                </View>

                <View style={styles.heroBottom}>
                  <View style={styles.heroInfo}>
                    <Text style={styles.heroOverline}>
                      {(TYPE_LABEL[promo.productType] || 'Colección').toUpperCase()} EN OFERTA
                    </Text>
                    <Text style={styles.heroName} numberOfLines={1}>{promo.name}</Text>
                    <View style={styles.heroPrices}>
                      <Text style={styles.heroPrice}>${promo.discountedPrice.toFixed(2)}</Text>
                      <Text style={styles.heroPriceOld}>${promo.price.toFixed(2)}</Text>
                      <View style={styles.heroDiscount}>
                        <Text style={styles.heroDiscountText}>-{promo.discountPercentage}%</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>Pedir</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.text} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : heroImages.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={heroWidth + 12}
            decelerationRate="fast"
          >
            {heroImages.map((hero) => (
              <View key={hero._id} style={[styles.hero, { width: heroWidth }]}>
                <Image source={{ uri: hero.url }} style={styles.heroImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        ) : null}

        {bestsellers.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitles}>
                <Text style={styles.sectionTitle}>Más Vendidos</Text>
                <Text style={styles.sectionSub}>Favoritos del taller esta semana</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Products', { tab: 'bestsellers' })}>
                <Text style={styles.sectionLink}>Ver catálogo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              {bestsellers.map((item) => (
                <HomeProductCard
                  key={item.productType + '-' + item.id}
                  product={item}
                  variant="carousel"
                  overline={TYPE_LABEL[item.productType]}
                  specs={specsOf(item)}
                  isFavorite={isFavorite(item)}
                  onPress={() => openProduct(item)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onAdd={() => addToCart(item)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        {newArrivals.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitles}>
                <Text style={styles.sectionTitle}>Novedades Recientes</Text>
                <Text style={styles.sectionSub}>Llegadas exclusivas al catálogo</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                <Text style={styles.sectionLink}>Explorar todo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {newArrivals.map((item) => (
                <HomeProductCard
                  key={item.productType + '-' + item.id}
                  product={item}
                  overline={TYPE_LABEL[item.productType]}
                  badge={isRecentlyAdded(item) ? 'Nuevo' : undefined}
                  specs={specsOf(item)}
                  isFavorite={isFavorite(item)}
                  onPress={() => openProduct(item)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onAdd={() => addToCart(item)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.adviceCard}>
          <View style={styles.adviceTag}>
            <Ionicons name="leaf" size={12} color={colors.maroon} />
            <Text style={styles.adviceTagText}>ASESORÍA BOTÁNICA</Text>
          </View>
          <Text style={styles.adviceTitle}>¿Dudas con tu planta?</Text>
          <Text style={styles.adviceSub}>
            Escríbenos por el canal que prefieras y te guiamos paso a paso.
          </Text>
          <View style={styles.adviceRow}>
            {SOCIAL_CHANNELS.filter((channel) => socialMedia[channel.key]).map((channel) => (
              <TouchableOpacity
                key={channel.key}
                style={styles.adviceOption}
                onPress={() => Linking.openURL(socialMedia[channel.key])}
                activeOpacity={0.8}
              >
                <Ionicons name={channel.icon} size={20} color={colors.primary} />
                <Text style={styles.adviceOptionTitle}>{channel.label}</Text>
                <Text style={styles.adviceOptionHint}>{channel.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {community.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitles}>
                <Text style={styles.sectionTitle}>Comunidad del Atelier</Text>
                <Text style={styles.sectionSub}>Rincones creados por nuestros clientes</Text>
              </View>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={11} color="#E8A33D" />
                <Text style={styles.ratingText}>{rating.average.toFixed(1)}/5</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              {community.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHead}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitial}>
                        {review.clientName?.trim()?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.reviewWho}>
                      <Text style={styles.reviewName} numberOfLines={1}>{review.clientName}</Text>
                      <Text style={styles.reviewDate}>{timeAgo(review.createdAt)}</Text>
                    </View>
                  </View>

                  <View style={styles.stars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Ionicons
                        key={index}
                        name={index < review.rating ? 'star' : 'star-outline'}
                        size={11}
                        color="#E8A33D"
                      />
                    ))}
                  </View>

                  <Text style={styles.reviewText} numberOfLines={4}>{review.comment}</Text>

                  <View style={styles.reviewProduct}>
                    <Ionicons name="bag-check-outline" size={12} color={colors.maroon} />
                    <Text style={styles.reviewProductText} numberOfLines={1}>
                      Compró: {review.productName}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.loyaltyCard}>
          <Text style={styles.loyaltyTag}>FIDELIDAD</Text>
          <Text style={styles.loyaltyTitle}>10% de retorno en hojas</Text>
          <Text style={styles.loyaltySub}>
            Ganas 1 hoja por cada $1 de tus pedidos y cada 10 hojas valen $1 en tu próxima compra.
          </Text>
          {loyaltyPoints != null ? (
            <View style={styles.loyaltyBalance}>
              <Ionicons name="leaf" size={15} color={colors.white} />
              <Text style={styles.loyaltyBalanceText}>
                Tienes {loyaltyPoints} hojas · ${(loyaltyPoints * 0.1).toFixed(2)} disponibles
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.loyaltyButton}
            onPress={() => navigation.navigate('LoyaltyPoints')}
            activeOpacity={0.85}
          >
            <Text style={styles.loyaltyButtonText}>Ver mi programa</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.trustRow}>
          {TRUST.map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.icon} size={16} color={colors.primary} />
              <Text style={styles.trustText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar active="Home" />
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.text },
    filterButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    announcement: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
    },
    announcementText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 8,
    },
    shippingStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    shippingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.maroon,
      marginRight: 8,
    },
    shippingText: { flex: 1, fontSize: 12, color: colors.text },

    greeting: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 20 },
    greetingSub: { fontSize: 13, color: colors.placeholder, marginTop: 5, lineHeight: 18 },

    chipsRow: { paddingVertical: 16, paddingRight: 8 },
    chip: {
      paddingHorizontal: 16,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipTextActive: { color: colors.white },

    loader: { marginVertical: 24 },
    errorBox: { alignItems: 'center', paddingVertical: 20 },
    errorText: { fontSize: 13, color: colors.placeholder, textAlign: 'center' },
    errorRetry: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 8 },

    hero: {
      height: 220,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.card,
      marginRight: 12,
    },
    heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12, 32, 20, 0.35)' },
    heroTag: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(12, 32, 20, 0.7)',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroTagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#E8A33D', marginRight: 6 },
    heroTagText: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700', color: colors.white },
    heroBottom: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    heroInfo: { flex: 1, marginRight: 12 },
    heroOverline: {
      fontSize: 9,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.8)',
    },
    heroName: { fontFamily: SERIF, fontSize: 21, fontWeight: '700', color: colors.white, marginTop: 4 },
    heroPrices: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    heroPrice: { fontSize: 16, fontWeight: '700', color: colors.white },
    heroPriceOld: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)',
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    heroDiscount: {
      backgroundColor: colors.maroon,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 8,
    },
    heroDiscountText: { fontSize: 10, fontWeight: '700', color: colors.white },
    heroButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 14,
      height: 36,
    },
    heroButtonText: { fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 6 },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: 26,
      marginBottom: 14,
    },
    sectionTitles: { flex: 1, marginRight: 12 },
    sectionTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    sectionSub: { fontSize: 12, color: colors.placeholder, marginTop: 3 },
    sectionLink: { fontSize: 12, fontWeight: '700', color: colors.maroon },
    carousel: { overflow: 'visible' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    ratingPill: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 },

    adviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 26,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    adviceTag: { flexDirection: 'row', alignItems: 'center' },
    adviceTagText: {
      fontSize: 9,
      letterSpacing: 1.3,
      fontWeight: '700',
      color: colors.maroon,
      marginLeft: 6,
    },
    adviceTitle: {
      fontFamily: SERIF,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 10,
    },
    adviceSub: { fontSize: 12, color: colors.placeholder, marginTop: 6, lineHeight: 17 },
    adviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    adviceOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      marginHorizontal: 4,
      borderRadius: 14,
      backgroundColor: isDark ? colors.card : '#F6F8F6',
    },
    adviceOptionTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 7 },
    adviceOptionHint: { fontSize: 10, color: colors.placeholder, marginTop: 2 },

    reviewCard: {
      width: 250,
      marginRight: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
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
    reviewInitial: { fontSize: 14, fontWeight: '700', color: colors.primary },
    reviewWho: { flex: 1, marginLeft: 10 },
    reviewName: { fontSize: 13, fontWeight: '700', color: colors.text },
    reviewDate: { fontSize: 11, color: colors.placeholder, marginTop: 1 },
    stars: { flexDirection: 'row', marginTop: 10 },
    reviewText: {
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.text,
      marginTop: 8,
      fontStyle: 'italic',
    },
    reviewProduct: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    reviewProductText: { fontSize: 11, fontWeight: '700', color: colors.maroon, marginLeft: 5, flex: 1 },

    loyaltyCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginTop: 26 },
    loyaltyTag: { fontSize: 9, letterSpacing: 1.6, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    loyaltyTitle: {
      fontFamily: SERIF,
      fontSize: 21,
      fontWeight: '700',
      color: colors.white,
      marginTop: 8,
    },
    loyaltySub: { fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
    loyaltyBalance: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 44,
      marginTop: 16,
    },
    loyaltyBalanceText: { fontSize: 12.5, fontWeight: '600', color: colors.white, marginLeft: 8 },
    loyaltyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.maroon,
      borderRadius: 12,
      height: 46,
      marginTop: 12,
    },
    loyaltyButtonText: { fontSize: 14, fontWeight: '700', color: colors.white, marginRight: 8 },

    trustRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
    trustItem: { flex: 1, alignItems: 'center' },
    trustText: { fontSize: 10.5, color: colors.placeholder, marginTop: 6, textAlign: 'center' },
  });
