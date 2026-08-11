import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import { colors } from '../theme/colors.jsx';
import { mockAddresses } from '../mocks/shopMockData.js';

//Ubicaciones Actuales y direcciones guardadas

export default function AddressListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dirección de envío</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={mockAddresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
            </View>

            {item.lines.map((line) => (
              <Text key={line} style={styles.cardLine}>{line}</Text>
            ))}
            <Text style={styles.cardPhone}>{item.phone}</Text>

            <View style={styles.cardFooter}>
              {item.isPrimary ? (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Principal</Text>
                </View>
              ) : <View />}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('EditLocation')}
                >
                  <Ionicons name="pencil" size={13} color={colors.text} />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                {!item.isPrimary ? (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="trash" size={13} color={colors.maroon} />
                    <Text style={[styles.actionText, { color: colors.maroon }]}>Eliminar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('EnterLocation')}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addButtonText}>Agregar nueva dirección</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.footer}>
        <Button label="Continuar" onPress={() => navigation.navigate('MapLocation')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.shopBg },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  list: { padding: 20 },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cardLine: { fontSize: 12, color: colors.placeholder, lineHeight: 18 },
  cardPhone: { fontSize: 12, color: colors.text, marginTop: 4, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  primaryBadge: { backgroundColor: colors.maroon, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  primaryBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  cardActions: { flexDirection: 'row' },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 14 },
  actionText: { fontSize: 12, color: colors.text, marginLeft: 4, fontWeight: '600' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 14, marginTop: 4,
  },
  addButtonText: { color: colors.primary, fontWeight: '700', fontSize: 13, marginLeft: 6 },
  footer: { paddingHorizontal: 20, paddingBottom: 20 },
});
