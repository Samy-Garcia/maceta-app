import { useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import OsmMapPicker from '../components/OsmMapPicker.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { usePayment } from '../hooks/usePayment.jsx';
import { useShippingMap } from '../hooks/useShippingMap.jsx';

export default function PaymentScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const mapRef = useRef(null);
  const {
    items, itemLabel, fullName, setFullName, phone, setPhone,
    addressText, setAddressText, deliveryMode, setDeliveryMode, isPickup,
    pickupLocations, pickup, selectedPickup, setSelectedPickup,
    savedAddresses, savedVisible, setSavedVisible, useSavedAddress, recalculating,
    shippingInfo, goToChangeAddress,
    couponInput, setCouponInput, appliedCoupon, couponError, applyCoupon,
    subtotal, discount, shippingCost, total,
    freeShippingFrom, qualifiesForFreeShipping,
    paying, error, pay,
  } = usePayment(navigation);

  // El mapa embebido comparte la misma lógica del mapa a pantalla completa:
  // marca el punto, geocodifica dentro del WebView y calcula la ruta real.
  const map = useShippingMap(navigation, 'Payment');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <View style={styles.headerBrandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Finalizar compra</Text>
          </View>
          <Text style={styles.headerNote}>Tu pedido se confirma directo con el taller</Text>
        </View>
        <Ionicons name="lock-closed-outline" size={17} color={colors.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos de envío</Text>
          <Text style={styles.cardNote}>
            Elige si quieres recibirlo en tu dirección o pasar a traerlo al taller.
          </Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, !isPickup && styles.modeButtonActive]}
              onPress={() => setDeliveryMode('delivery')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="home-outline"
                size={15}
                color={!isPickup ? colors.white : colors.text}
              />
              <Text style={[styles.modeText, !isPickup && styles.modeTextActive]}>
                Envío a domicilio
              </Text>
            </TouchableOpacity>
            {pickupLocations.length > 0 ? (
              <TouchableOpacity
                style={[styles.modeButton, isPickup && styles.modeButtonActive]}
                onPress={() => setDeliveryMode('pickup')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="storefront-outline"
                  size={15}
                  color={isPickup ? colors.white : colors.text}
                />
                <Text style={[styles.modeText, isPickup && styles.modeTextActive]}>
                  Recoger en tienda
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {isPickup ? (
            <View style={styles.pickupList}>
              {pickupLocations.map((place, index) => {
                const active = index === selectedPickup;
                return (
                  <TouchableOpacity
                    key={place.name + index}
                    style={[styles.pickupRow, active && styles.pickupRowActive]}
                    onPress={() => setSelectedPickup(index)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.pickupTexts}>
                      <Text style={styles.pickupName}>{place.name}</Text>
                      <Text style={styles.pickupAddress}>{place.address}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={styles.freeBadge}>
                <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                <Text style={styles.freeBadgeText}>Retirar en tienda no tiene costo de envío</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.addressButtons}>
                <TouchableOpacity
                  style={styles.addressButton}
                  onPress={goToChangeAddress}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location-outline" size={15} color={colors.text} />
                  <Text style={styles.addressButtonText}>Abrir mapa completo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addressButton, !savedAddresses.length && styles.addressButtonDisabled]}
                  onPress={() => setSavedVisible(true)}
                  disabled={!savedAddresses.length}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bookmark-outline" size={15} color={colors.text} />
                  <Text style={styles.addressButtonText}>Dirección guardada</Text>
                </TouchableOpacity>
              </View>

              {qualifiesForFreeShipping ? (
                <View style={styles.freeBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  <Text style={styles.freeBadgeText}>¡Tu pedido califica para envío gratis!</Text>
                </View>
              ) : freeShippingFrom != null ? (
                <View style={styles.freeBadge}>
                  <Ionicons name="information-circle-outline" size={13} color={colors.primary} />
                  <Text style={styles.freeBadgeText}>
                    Envío gratis en compras desde ${freeShippingFrom.toFixed(2)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.mapBox}>
                <OsmMapPicker
                  ref={mapRef}
                  storeLat={map.store.lat}
                  storeLng={map.store.lng}
                  onSelect={map.selectLocation}
                  onGeocode={map.applyGeocode}
                />
              </View>
              <Text style={styles.mapHint}>
                Toca el mapa para marcar tu dirección exacta de entrega.
              </Text>

              {map.loading ? (
                <Text style={styles.mapCalc}>Calculando ruta...</Text>
              ) : map.route ? (
                <TouchableOpacity style={styles.mapResult} onPress={map.confirm} activeOpacity={0.85}>
                  <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                  <Text style={styles.mapResultText} numberOfLines={2}>
                    {(map.route.distanciaMetros / 1000).toFixed(2)} km ·{' '}
                    {map.shippingCost > 0 ? '$' + map.shippingCost.toFixed(2) : 'Envío gratis'} — toca
                    para usar este punto
                  </Text>
                </TouchableOpacity>
              ) : map.error ? (
                <Text style={styles.mapError}>{map.error}</Text>
              ) : null}

              <Text style={styles.label}>DIRECCIÓN DE ENVÍO</Text>
              <TextInput
                style={styles.input}
                value={addressText}
                onChangeText={setAddressText}
                placeholder="Ej: Res. Las Flores, calle 3, casa #12, San Salvador"
                placeholderTextColor={colors.placeholder}
                multiline
              />
              {recalculating ? (
                <Text style={styles.mapCalc}>Recalculando envío...</Text>
              ) : null}
            </>
          )}

          <Text style={styles.label}>NOMBRE DE QUIEN RECIBE</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nombre y apellido"
            placeholderTextColor={colors.placeholder}
          />

          <Text style={styles.label}>TELÉFONO DE CONTACTO</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="7000-0000"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
          />

          <View style={styles.couponHead}>
            <Text style={styles.label}>CÓDIGO DE DESCUENTO O ENVÍO GRATIS</Text>
            <Text style={styles.optional}>Opcional</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              value={couponInput}
              onChangeText={setCouponInput}
              placeholder="Ej: M503-A1B2C3"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.couponButton} onPress={applyCoupon} activeOpacity={0.85}>
              <Text style={styles.couponButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
          {appliedCoupon ? (
            <Text style={styles.couponOk}>
              Cupón aplicado:{' '}
              {appliedCoupon.type === 'shipping'
                ? 'envío gratis'
                : appliedCoupon.discountPercent + '% de descuento'}
            </Text>
          ) : null}
          <Text style={styles.couponHint}>
            Consigue códigos canjeando tus hojas en el programa de fidelidad.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen del pedido</Text>

          {items.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              {item.product?.image ? (
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemImageFallback]}>
                  <Ionicons name="leaf-outline" size={16} color={colors.placeholder} />
                </View>
              )}
              <View style={styles.itemTexts}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
                <Text style={styles.itemMeta}>
                  Cantidad: {item.quantity} · {itemLabel(item)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>${item.subtotal?.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento</Text>
              <Text style={styles.discountValue}>-${discount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            {shippingCost > 0 ? (
              <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
            ) : (
              <View style={styles.freeTag}>
                <Text style={styles.freeTagText}>{isPickup ? 'Retiro en tienda' : 'Gratis'}</Text>
              </View>
            )}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <View style={styles.totalAmount}>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              <Text style={styles.totalCurrency}>USD</Text>
            </View>
          </View>

          <View style={styles.deliverNote}>
            <Ionicons name="time-outline" size={14} color={colors.placeholder} />
            <Text style={styles.deliverNoteText}>
              {isPickup
                ? 'Se retira en: ' + (pickup ? pickup.name : 'punto por elegir')
                : shippingInfo
                ? 'Se entregará en: ' + (shippingInfo.municipality || 'la dirección marcada')
                : 'Marca la dirección para calcular el envío.'}
            </Text>
          </View>
        </View>

        <ErrorText message={error} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, paying && styles.payButtonDisabled]}
          onPress={pay}
          disabled={paying}
          activeOpacity={0.85}
        >
          {paying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={15} color={colors.white} />
              <Text style={styles.payText}>Confirmar pedido — ${total.toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={savedVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavedVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSavedVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Tus direcciones guardadas</Text>
            <ScrollView>
              {savedAddresses.map((address) => (
                <TouchableOpacity
                  key={address._id}
                  style={styles.savedRow}
                  onPress={() => useSavedAddress(address)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location-outline" size={16} color={colors.maroon} />
                  <View style={styles.savedTexts}>
                    <Text style={styles.savedLine}>{address.addressLine}</Text>
                    <Text style={styles.savedPlace}>
                      {[address.municipality, address.department].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    headerTitles: { alignItems: 'center' },
    headerBrandRow: { flexDirection: 'row', alignItems: 'center' },
    headerLogo: { width: 18, height: 18, marginRight: 7 },
    headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    headerNote: { fontSize: 10.5, color: colors.placeholder, marginTop: 2 },

    content: { paddingHorizontal: 20, paddingBottom: 20 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    cardNote: { fontSize: 12, lineHeight: 17, color: colors.placeholder, marginTop: 5 },

    modeRow: { flexDirection: 'row', marginTop: 14 },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 12,
      marginRight: 8,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    modeButtonActive: { backgroundColor: colors.primary },
    modeText: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginLeft: 7 },
    modeTextActive: { color: colors.white },

    pickupList: { marginTop: 14 },
    pickupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    pickupRowActive: { borderColor: colors.primary },
    pickupTexts: { flex: 1, marginLeft: 10 },
    pickupName: { fontSize: 13, fontWeight: '700', color: colors.text },
    pickupAddress: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

    addressButtons: { flexDirection: 'row', marginTop: 14 },
    addressButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 12,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    addressButtonDisabled: { opacity: 0.45 },
    addressButtonText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 6 },

    freeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 12,
    },
    freeBadgeText: { flex: 1, fontSize: 11.5, fontWeight: '600', color: colors.primary, marginLeft: 7 },

    mapBox: {
      height: 220,
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 12,
      backgroundColor: colors.card,
    },
    mapHint: { fontSize: 11, color: colors.placeholder, textAlign: 'center', marginTop: 8 },
    mapCalc: { fontSize: 11.5, color: colors.primary, marginTop: 8 },
    mapError: { fontSize: 11.5, color: colors.maroon, marginTop: 8 },
    mapResult: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 10,
    },
    mapResultText: { flex: 1, fontSize: 11.5, fontWeight: '600', color: colors.primary, marginLeft: 7 },

    label: {
      fontSize: 9.5,
      letterSpacing: 1.1,
      fontWeight: '700',
      color: colors.placeholder,
      marginTop: 18,
      marginBottom: 7,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 48,
      fontSize: 14,
      color: colors.text,
      backgroundColor: isDark ? colors.surface : '#F7F9F8',
    },

    couponHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    optional: { fontSize: 10.5, color: colors.placeholder, marginTop: 18 },
    couponRow: { flexDirection: 'row', alignItems: 'center' },
    couponInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 48,
      fontSize: 14,
      color: colors.text,
      backgroundColor: isDark ? colors.surface : '#F7F9F8',
    },
    couponButton: {
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginLeft: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    couponButtonText: { fontSize: 13, fontWeight: '700', color: colors.text },
    couponError: { fontSize: 11.5, color: colors.maroon, marginTop: 8 },
    couponOk: { fontSize: 11.5, fontWeight: '700', color: colors.primary, marginTop: 8 },
    couponHint: { fontSize: 10.5, lineHeight: 15, color: colors.placeholder, marginTop: 8 },

    itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    itemImage: { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.border },
    itemImageFallback: { alignItems: 'center', justifyContent: 'center' },
    itemTexts: { flex: 1, marginHorizontal: 11 },
    itemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    itemPrice: { fontSize: 13.5, fontWeight: '700', color: colors.text },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    summaryLabel: { fontSize: 12.5, color: colors.placeholder },
    summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.text },
    discountValue: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
    freeTag: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    freeTagText: { fontSize: 11, fontWeight: '700', color: colors.primary },

    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    totalAmount: { flexDirection: 'row', alignItems: 'baseline' },
    totalValue: { fontFamily: SERIF, fontSize: 22, fontWeight: '700', color: colors.text },
    totalCurrency: { fontSize: 10, color: colors.placeholder, marginLeft: 5 },

    deliverNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isDark ? colors.card : '#F7F9F8',
      borderRadius: 12,
      padding: 12,
      marginTop: 14,
    },
    deliverNoteText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: colors.placeholder, marginLeft: 7 },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor: isDark ? colors.card : colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    payButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.primary,
    },
    payButtonDisabled: { opacity: 0.6 },
    payText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 8 },

    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
      maxHeight: '70%',
      backgroundColor: isDark ? colors.card : colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 28,
    },
    sheetTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    savedTexts: { flex: 1, marginLeft: 10 },
    savedLine: { fontSize: 13, fontWeight: '700', color: colors.text },
    savedPlace: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },
  });
