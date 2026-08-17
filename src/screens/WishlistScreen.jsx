import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useWishlist } from '../hooks/useWishlist.jsx';

// Lista de deseos real (GET /api/wishlist/mine + GET /api/wishlist/mine/:id):
// los productos que el cliente marcó con el corazón en Productos/Home/Detalle.
export default function WishlistScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { items, totalCount, loading, error, retry, query, setQuery, removingId, handleRemove, handleAddToCart } =
    useWishlist();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.white} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar en tu lista..."
            style={styles.searchInput}
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
        </View>
        <Text style={styles.headerTitle}>Mi Lista De Deseos ({totalCount})</Text>
      </View>

      {loading ? <Text style={styles.stateText}>Cargando tu lista de deseos...</Text> : null}
      {error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity onPress={retry}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.emptyText}>
              {query ? 'No hay resultados para tu búsqueda.' : 'Tu lista de deseos está vacía. Toca el corazón en un producto para guardarlo aquí.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                product: { id: item.productId, productType: item.productType, name: item.product?.name, image: item.product?.image, price: item.product?.price, stock: item.product?.stock },
              })
            }
          >
            <View style={styles.imagePlaceholder}>
              {item.product?.image ? (
                <Image source={{ uri: item.product.image }} style={styles.productImage} resizeMode="cover" />
              ) : (
                <Ionicons name="leaf-outline" size={22} color={colors.placeholder} />
              )}
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleRemove(item)}
                disabled={removingId === item._id}
              >
                <Ionicons name="heart" size={16} color={colors.maroon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.product?.name || 'Producto eliminado'}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.price}>$ {item.product?.price?.toFixed(2) ?? '—'}</Text>
              <TouchableOpacity
                style={[styles.addButton, !item.product?.stock && styles.addButtonDisabled]}
                onPress={() => handleAddToCart(item)}
                disabled={!item.product?.stock}
              >
                <Ionicons name="add" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <BottomTabBar active="Productos" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    header: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
    searchBar: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
      paddingHorizontal: 14, height: 38, marginBottom: 14,
    },
    searchInput: { marginLeft: 8, color: colors.white, flex: 1, fontSize: 13 },
    headerTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 16 },
    stateBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
    list: { padding: 20 },
    row: { justifyContent: 'space-between' },
    emptyText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 24, paddingHorizontal: 20 },
    card: { width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 14 },
    imagePlaceholder: {
      width: '100%', height: 100, borderRadius: 10, backgroundColor: colors.border, marginBottom: 8,
      overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    },
    productImage: { width: '100%', height: '100%' },
    heartButton: {
      position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13,
      backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
    name: { fontSize: 12, fontWeight: '700', color: colors.text },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    price: { fontSize: 13, fontWeight: '700', color: colors.primary },
    addButton: {
      width: 22, height: 22, borderRadius: 6, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    addButtonDisabled: { opacity: 0.4 },
  });
