import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useQuotationBuilder } from '../hooks/useQuotationBuilder.jsx';
import { EVENT_TYPES } from '../utils/quotationStatus.js';
import { formatBirthDate } from '../utils/birthDate.js';

// "Cotiza tu evento": igual que /cotizaciones en la web — se arma la lista de
// productos deseados y se piden los detalles del evento. La dirección se
// escribe a mano (la app no usa mapa), el resto sigue la misma lógica real.
export default function QuotationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const [pickerVisible, setPickerVisible] = useState(false);
  const {
    tabs, activeTab, setActiveTab, products, loading,
    getQuantity, adjustQuantity, addItem,
    items, removeItem, total,
    eventType, setEventType, eventDate, setEventDate,
    guestCount, setGuestCount, location, setLocation,
    specialRequirements, setSpecialRequirements,
    submitting, error, submit,
  } = useQuotationBuilder(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cotiza tu evento</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyQuotations')}>
          <Ionicons name="document-text-outline" size={21} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Cotiza tu evento</Text>
        <Text style={styles.subtitle}>
          Personaliza la atmósfera de tu celebración con nuestro catálogo. Selecciona tus favoritos y
          recibe una propuesta detallada.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.85}
              >
                <Ionicons name={tab.icon} size={20} color={active ? colors.white : colors.text} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={28} color={colors.placeholder} />
                  )}
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>${(Number(product.price) || 0).toFixed(2)} / unidad</Text>

                <View style={styles.productActions}>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => adjustQuantity(product, -1)}>
                      <Text style={styles.stepperText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{getQuantity(product)}</Text>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => adjustQuantity(product, 1)}>
                      <Text style={styles.stepperText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.addButton} onPress={() => addItem(product)} activeOpacity={0.85}>
                    <Text style={styles.addButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {!loading && products.length === 0 ? (
              <Text style={styles.emptyText}>No hay productos en esta categoría todavía.</Text>
            ) : null}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Detalles del evento</Text>
          </View>

          <Text style={styles.label}>FECHA DEL EVENTO</Text>
          <TouchableOpacity style={styles.input} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
            <Text style={eventDate ? styles.inputText : styles.inputPlaceholder}>
              {eventDate ? formatBirthDate(eventDate) : 'Elige la fecha'}
            </Text>
            <Ionicons name="chevron-down" size={15} color={colors.placeholder} />
          </TouchableOpacity>
          {pickerVisible ? (
            <DateTimePicker
              value={eventDate || new Date()}
              mode="date"
              display="spinner"
              minimumDate={new Date()}
              onChange={(event, selected) => {
                if (Platform.OS === 'android') setPickerVisible(false);
                if (event.type === 'dismissed') return;
                if (selected) setEventDate(selected);
              }}
            />
          ) : null}

          <Text style={styles.label}>CANTIDAD DE INVITADOS</Text>
          <TextInput
            style={styles.textInput}
            value={guestCount}
            onChangeText={(text) => setGuestCount(text.replace(/\D/g, ''))}
            placeholder="Ej: 50"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>TIPO DE EVENTO</Text>
          <View style={styles.eventTypeRow}>
            {EVENT_TYPES.map((type) => {
              const active = type === eventType;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.eventTypeChip, active && styles.eventTypeChipActive]}
                  onPress={() => setEventType(type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.eventTypeText, active && styles.eventTypeTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>LUGAR DEL EVENTO</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={location}
            onChangeText={setLocation}
            placeholder="Dirección o referencia del lugar"
            placeholderTextColor={colors.placeholder}
            multiline
          />

          <Text style={styles.label}>¿ALGÚN REQUERIMIENTO ESPECIAL?</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={specialRequirements}
            onChangeText={setSpecialRequirements}
            placeholder="Colores, estilo, alguna petición puntual..."
            placeholderTextColor={colors.placeholder}
            multiline
          />
        </View>

        <View style={styles.cartCard}>
          <View style={styles.cartTitleRow}>
            <Text style={styles.cartTitle}>Tu cotización</Text>
            <Text style={styles.cartCount}>
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.cartEmpty}>Todavía no has agregado ningún producto.</Text>
          ) : (
            items.map((item) => (
              <View key={item.productType + '-' + item.productId} style={styles.cartRow}>
                <View style={styles.cartRowTexts}>
                  <Text style={styles.cartRowName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.cartRowMeta}>x{item.quantity} · ${item.unitPrice.toFixed(2)} c/u</Text>
                </View>
                <Text style={styles.cartRowPrice}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity
                  onPress={() => removeItem(item.productType, item.productId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={colors.placeholder} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {items.length > 0 ? (
            <>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Total Est.</Text>
                <Text style={styles.cartTotalValue}>${total.toFixed(2)}</Text>
              </View>
              <Text style={styles.cartNote}>
                Este total es solo una referencia — el precio final (con posibles descuentos por volumen y
                logística) te lo confirmamos por correo.
              </Text>
            </>
          ) : null}
        </View>

        <ErrorText message={error} />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Solicitar Cotización</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    headerTitle: { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: colors.text },

    content: { paddingHorizontal: 20, paddingBottom: 30 },

    title: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 4 },
    subtitle: { fontSize: 12.5, lineHeight: 19, color: colors.placeholder, marginTop: 8 },

    tabsRow: { paddingVertical: 16, paddingRight: 8 },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 92,
      height: 76,
      borderRadius: 16,
      marginRight: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: 11.5, fontWeight: '700', color: colors.text, marginTop: 6 },
    tabTextActive: { color: colors.white },

    loader: { marginVertical: 24 },
    emptyText: { fontSize: 13, color: colors.placeholder, textAlign: 'center', paddingVertical: 20, width: '100%' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productCard: {
      width: '48%',
      marginBottom: 14,
      padding: 10,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    productImageWrap: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 12,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginBottom: 8,
    },
    productImage: { width: '100%', height: '100%' },
    productName: { fontSize: 12.5, fontWeight: '700', color: colors.text, minHeight: 32 },
    productPrice: { fontSize: 12.5, fontWeight: '700', color: colors.primary, marginTop: 4, marginBottom: 10 },

    productActions: { gap: 8 },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    stepperButton: { width: 36, alignItems: 'center', justifyContent: 'center' },
    stepperText: { fontSize: 16, fontWeight: '700', color: colors.text },
    stepperValue: { fontSize: 13, fontWeight: '700', color: colors.text },
    addButton: {
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    addButtonText: { fontSize: 12.5, fontWeight: '700', color: colors.white },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 18,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 8 },

    label: {
      fontSize: 9.5,
      letterSpacing: 1.1,
      fontWeight: '700',
      color: colors.placeholder,
      marginTop: 16,
      marginBottom: 7,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      backgroundColor: isDark ? colors.card : '#F7F9F8',
    },
    inputText: { fontSize: 14, color: colors.text },
    inputPlaceholder: { fontSize: 14, color: colors.placeholder },
    textInput: {
      minHeight: 48,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      backgroundColor: isDark ? colors.card : '#F7F9F8',
    },
    textArea: { minHeight: 70, textAlignVertical: 'top' },

    eventTypeRow: { flexDirection: 'row', flexWrap: 'wrap' },
    eventTypeChip: {
      paddingHorizontal: 13,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    eventTypeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    eventTypeText: { fontSize: 12, fontWeight: '600', color: colors.text },
    eventTypeTextActive: { color: colors.white },

    cartCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cartTitleRow: { flexDirection: 'row', alignItems: 'baseline' },
    cartTitle: { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: colors.text, marginRight: 6 },
    cartCount: { fontSize: 12, fontWeight: '400', color: colors.placeholder },
    cartEmpty: { fontSize: 12.5, color: colors.placeholder, marginTop: 10 },

    cartRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    cartRowTexts: { flex: 1, marginRight: 8 },
    cartRowName: { fontSize: 13, fontWeight: '600', color: colors.text },
    cartRowMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    cartRowPrice: { fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 10 },

    cartTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cartTotalLabel: { fontFamily: SERIF, fontSize: 16, fontWeight: '700', color: colors.text },
    cartTotalValue: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.primary },
    cartNote: { fontSize: 10.5, lineHeight: 15, color: colors.placeholder, marginTop: 8 },

    submitButton: {
      height: 56,
      borderRadius: 28,
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  });
