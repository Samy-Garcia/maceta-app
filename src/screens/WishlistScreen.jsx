import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { colors } from '../theme/colors.jsx';

// lista de deseos
export default function WishlistScreen() {
  const [tab, setTab] = useState('concrete'); // 'concrete' | 'wishlist'
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.white} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar..."
            style={styles.searchInput}
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
          <Ionicons name="menu" size={20} color={colors.white} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('concrete')}>
            <Text style={[styles.tabLabel, tab === 'concrete' && styles.tabLabelActive]}>Concreto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('wishlist')}>
            <Text style={[styles.tabLabel, tab === 'wishlist' && styles.tabLabelActive]}>Mi Lista De Deseos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {query ? <Text style={styles.resultsTitle}>Resultados de "{query}"</Text> : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={[]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={<Text style={styles.emptyText}>Tu lista de deseos está vacía.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Image source={item.image} style={styles.productImage} resizeMode="cover" />
              <Ionicons name="heart" size={16} color={colors.text} style={styles.heartIcon} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < item.rating ? 'star' : 'star-outline'}
                  size={10}
                  color={colors.maroon}
                />
              ))}
            </View>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
        )}
      />

      <BottomTabBar active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.shopBg },
  header: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 14, height: 38, marginBottom: 14,
  },
  searchInput: { marginLeft: 8, color: colors.white, flex: 1, fontSize: 13 },
  tabs: { flexDirection: 'row' },
  tabLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', marginRight: 20, paddingBottom: 4 },
  tabLabelActive: { color: colors.white, borderBottomWidth: 2, borderBottomColor: colors.white },
  resultsTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 16, marginHorizontal: 20 },
  list: { padding: 20 },
  row: { justifyContent: 'space-between' },
  emptyText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 24 },
  card: { width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 14 },
  imagePlaceholder: {
    width: '100%', height: 100, borderRadius: 10, backgroundColor: colors.border, marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  heartIcon: { position: 'absolute', top: 6, right: 6 },
  name: { fontSize: 12, fontWeight: '700', color: colors.text },
  ratingRow: { flexDirection: 'row', marginTop: 4 },
  price: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 4 },
});
