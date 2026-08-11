import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { colors } from '../theme/colors.jsx';
import { mockCategories, mockPopularProducts } from '../mocks/shopMockData.js';

// Inicio con datos locales.

// Esta es la pantalla que aparece después del login.
// Desde Home se puede entrar a ver todos o tocar el banner
// y seguir el proceso de ubicación.
export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.white} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.welcome}>Bienvenido a Macetas</Text>

            <View style={styles.banner}>
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>Nuevo</Text>
              </View>
              <Image
                source={require('../../assets/products/succulent-square.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.categoryRow}>
              {mockCategories.map((cat) => (
                <View key={cat} style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Populares</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EnterLocation')}>
                <Text style={styles.seeAll}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={mockPopularProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productImagePlaceholder}>
              <Image source={item.image} style={styles.productImage} resizeMode="cover" />
              <Ionicons
                name={item.favorite ? 'heart' : 'heart-outline'}
                size={16}
                color={colors.maroon}
                style={styles.heartIcon}
              />
            </View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDims}>{item.dimensions}</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>$ {item.price.toFixed(2)}</Text>
              <View style={styles.addButton}>
                <Ionicons name="add" size={16} color={colors.white} />
              </View>
            </View>
          </View>
        )}
      />

      <BottomTabBar active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.shopBg },
  header: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 38,
  },
  searchInput: { marginLeft: 8, color: colors.white, flex: 1, fontSize: 13 },
  content: { padding: 20, paddingBottom: 20 },
  welcome: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 },
  banner: {
    height: 150,
    borderRadius: 16,
    backgroundColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerImage: { width: '100%', height: '100%' },
  badgeNew: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeNewText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', marginBottom: 20 },
  categoryPill: {
    backgroundColor: colors.maroon,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 12, color: colors.maroon, fontWeight: '600', textDecorationLine: 'underline' },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 14 },
  productImagePlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  heartIcon: { position: 'absolute', top: 6, right: 6 },
  productName: { fontSize: 13, fontWeight: '700', color: colors.text },
  productDims: { fontSize: 10, color: colors.placeholder, marginTop: 2 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  productPrice: { fontSize: 13, fontWeight: '700', color: colors.text },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
