import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useEditCard } from '../hooks/useEditCard.jsx';

export default function EditCardScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    cardNumber, handleCardNumberChange, holder, setHolder, expiry, setExpiry, cvv, setCvv,
    previewLast4, previewBrand, saving, error, handleSave, handleDelete, isEditing,
  } = useEditCard(navigation, route?.params?.cardId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Tarjeta' : 'Agregar Tarjeta'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Método de Pago</Text>
        <Text style={styles.subtitle}>Maneja con cuidado tu método de pago</Text>

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.cardEyebrow}>DIGITAL WALLET</Text>
            <Ionicons name="card-outline" size={26} color="rgba(255,255,255,0.85)" />
          </View>

          <View style={styles.nfcIcon}>
            <Ionicons name="wifi" size={18} color={colors.white} style={styles.nfcRotate} />
          </View>

          <Text style={styles.cardNumberPreview}>
            •••• •••• •••• {previewLast4}
          </Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardSmallLabel}>TITULAR</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{holder || 'Nombre en tarjeta'}</Text>
            </View>
            <View>
              <Text style={[styles.cardSmallLabel, styles.textRight]}>VENCE</Text>
              <Text style={[styles.cardValue, styles.textRight]}>{expiry || 'MM/AA'}</Text>
            </View>
          </View>

          <Text style={styles.cardBrand}>{previewBrand}</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>Número de Tarjeta</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={19}
            />
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          </View>

          <Text style={styles.label}>Nombre en tarjeta</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={holder}
              onChangeText={setHolder}
              placeholder="Nombre como aparece en la tarjeta"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Fecha expiración</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/AA"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('¿Qué es el CVV?', 'Son los 3 o 4 dígitos de seguridad al reverso de tu tarjeta.')
                  }
                >
                  <Ionicons name="help-circle-outline" size={18} color={colors.placeholder} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.hint}>
            Por tu seguridad, el número completo y el CVV no se guardan: solo usamos los últimos 4 dígitos para
            identificar la tarjeta.
          </Text>
        </View>

        <ErrorText message={error} />

        <Button label="Guardar" icon="lock-closed" onPress={handleSave} loading={saving} />

        {isEditing ? (
          <TouchableOpacity style={styles.deleteLink} onPress={handleDelete}>
            <Ionicons name="trash" size={16} color={colors.maroonDark} />
            <Text style={styles.deleteLinkText}>Eliminar tarjeta</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
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
    content: { padding: 20, paddingBottom: 32 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 13, color: colors.placeholder, marginTop: 4, marginBottom: 20 },
    cardPreview: { borderRadius: 18, padding: 20, marginBottom: 20, minHeight: 190 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardEyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    nfcIcon: {
      width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center', justifyContent: 'center', marginTop: 12,
    },
    nfcRotate: { transform: [{ rotate: '90deg' }] },
    cardNumberPreview: { color: colors.white, fontSize: 20, fontWeight: '700', letterSpacing: 2, marginTop: 26 },
    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
    cardSmallLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
    cardValue: { color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 3, maxWidth: 160 },
    textRight: { textAlign: 'right' },
    cardBrand: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', marginTop: 10 },
    formCard: { backgroundColor: colors.card, borderRadius: 18, padding: 18, marginBottom: 16 },
    label: { fontSize: 13, color: colors.placeholder, marginBottom: 6, marginTop: 10 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
    },
    input: { flex: 1, fontSize: 14, color: colors.text },
    rowFields: { flexDirection: 'row', justifyContent: 'space-between' },
    halfField: { width: '48%' },
    hint: { fontSize: 11, color: colors.placeholder, marginTop: 14, lineHeight: 16 },
    deleteLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    deleteLinkText: { color: colors.maroonDark, fontWeight: '700', fontSize: 14, marginLeft: 8 },
  });
