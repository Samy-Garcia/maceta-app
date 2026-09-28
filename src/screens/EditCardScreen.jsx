import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useEditCard } from '../hooks/useEditCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function EditCardScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const [showCvv, setShowCvv] = useState(false);
  const toast = useToast();
  const {
    cardNumber, handleCardNumberChange, holder, setHolder, expiry, handleExpiryChange, cvv, setCvv,
    isDefault, setIsDefault, previewLast4, previewBrand,
    saving, error, handleSave, handleDelete, isEditing,
  } = useEditCard(navigation, route?.params?.cardId);

  const explainCvv = () =>
    toast.alert({
      title: '¿Qué es el CVV?',
      message:
        'Son los 3 dígitos al reverso de tu tarjeta (4 al frente en American Express). Sirven para verificar que la tarjeta es tuya y esta app no los guarda.',
      icon: 'help-circle',
      confirmLabel: 'Entendido',
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Macetas503</Text>
        <View style={styles.headerRight}>
          <View style={styles.lockButton}>
            <Ionicons name="lock-closed" size={15} color={colors.text} />
          </View>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Ionicons name="phone-portrait-outline" size={11} color={colors.primary} />
            <Text style={styles.pillText}>GUARDADA EN ESTE EQUIPO</Text>
          </View>
        </View>

        <Text style={styles.title}>{isEditing ? 'Editar tarjeta' : 'Agregar tarjeta'}</Text>
        <Text style={styles.subtitle}>
          Guarda los datos de tu tarjeta para no escribirlos cada vez que hagas un pedido.
        </Text>

        <LinearGradient
          colors={isDark ? ['#17301F', '#0E1F14'] : [colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.preview}
        >
          <View style={styles.previewTop}>
            <View style={styles.chip} />
            <Ionicons name="wifi" size={16} color="rgba(255,255,255,0.7)" style={styles.contactless} />
            <View style={styles.brandTag}>
              <Text style={styles.brandTagText}>{previewBrand.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.previewLabel}>NÚMERO DE TARJETA</Text>
          <Text style={styles.previewNumber}>••••  ••••  ••••  {previewLast4}</Text>

          <View style={styles.previewBottom}>
            <View style={styles.previewCol}>
              <Text style={styles.previewLabel}>TITULAR</Text>
              <Text style={styles.previewValue} numberOfLines={1}>
                {holder ? holder.toUpperCase() : 'NOMBRE DEL TITULAR'}
              </Text>
            </View>
            <View>
              <Text style={[styles.previewLabel, styles.textRight]}>EXPIRA</Text>
              <Text style={[styles.previewValue, styles.textRight]}>{expiry || 'MM / AA'}</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.label}>Nombre en la tarjeta</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={16} color={colors.placeholder} />
          <TextInput
            style={styles.input}
            value={holder}
            onChangeText={setHolder}
            maxLength={50}
            placeholder="Ej. Lissy Erazo"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />
        </View>

        <Text style={styles.label}>Número de tarjeta</Text>
        <View style={styles.inputRow}>
          <Ionicons name="card-outline" size={16} color={colors.placeholder} />
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            maxLength={19}
          />
          <View style={styles.inputTag}>
            <Text style={styles.inputTagText}>DÉBITO / CRÉDITO</Text>
          </View>
        </View>

        <View style={styles.doubleRow}>
          <View style={styles.doubleCol}>
            <Text style={styles.label}>Vencimiento</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.placeholder} />
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={handleExpiryChange}
                placeholder="MM/AA"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.doubleCol}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Código CVV</Text>
              <TouchableOpacity onPress={explainCvv} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.helpLink}>¿Qué es?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="keypad-outline" size={16} color={colors.placeholder} />
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="•••"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry={!showCvv}
              />
              <TouchableOpacity
                onPress={() => setShowCvv((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showCvv ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchIcon}>
            <Ionicons name="star" size={15} color={colors.primary} />
          </View>
          <View style={styles.switchTexts}>
            <Text style={styles.switchTitle}>Tarjeta principal</Text>
            <Text style={styles.switchNote}>Es la que aparece en tu perfil por defecto</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
          <Text style={styles.noteText}>
            Solo se guardan la marca, los últimos 4 dígitos, el titular y el vencimiento, y únicamente
            en este teléfono. El número completo y el CVV no se almacenan ni salen de aquí.
          </Text>
        </View>

        <ErrorText message={error} />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="card-outline" size={17} color={colors.white} />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Guardar cambios' : 'Guardar tarjeta'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Eliminar tarjeta</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    lockButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      marginRight: 8,
    },
    headerLogo: { width: 24, height: 24 },

    content: { paddingHorizontal: 20, paddingBottom: 30 },

    pillsRow: { flexDirection: 'row', marginTop: 4 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    pillText: {
      fontSize: 8.5,
      letterSpacing: 0.9,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 5,
    },

    title: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 12 },
    subtitle: { fontSize: 13, lineHeight: 19, color: colors.placeholder, marginTop: 6 },

    preview: { borderRadius: 20, padding: 20, marginTop: 18 },
    previewTop: { flexDirection: 'row', alignItems: 'center' },
    chip: { width: 34, height: 26, borderRadius: 6, backgroundColor: '#D9BE7E' },
    contactless: { marginLeft: 10, transform: [{ rotate: '90deg' }] },
    brandTag: {
      flex: 1,
      alignItems: 'flex-end',
    },
    brandTagText: {
      fontSize: 11,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: '#E4D7A8',
    },
    previewLabel: {
      fontSize: 8.5,
      letterSpacing: 1.2,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.6)',
      marginTop: 22,
    },
    previewNumber: {
      fontSize: 19,
      letterSpacing: 2,
      fontWeight: '700',
      color: colors.white,
      marginTop: 6,
    },
    previewBottom: { flexDirection: 'row', alignItems: 'flex-end' },
    previewCol: { flex: 1, marginRight: 16 },
    previewValue: { fontSize: 13.5, fontWeight: '700', color: colors.white, marginTop: 4 },
    textRight: { textAlign: 'right' },

    label: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    helpLink: { fontSize: 11.5, fontWeight: '700', color: colors.maroon, marginTop: 20 },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor: isDark ? colors.surface : '#F1F3F1',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
    },
    input: { flex: 1, marginLeft: 10, fontSize: 14.5, color: colors.text, padding: 0 },
    inputTag: {
      backgroundColor: isDark ? colors.card : '#E3E8E4',
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },
    inputTagText: { fontSize: 8.5, letterSpacing: 0.6, fontWeight: '700', color: colors.placeholder },

    doubleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    doubleCol: { width: '48%' },

    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      marginTop: 22,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    switchIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    switchTexts: { flex: 1, marginRight: 10 },
    switchTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    switchNote: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },

    noteBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      borderRadius: 16,
      padding: 14,
      marginTop: 14,
    },
    noteText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: colors.placeholder, marginLeft: 10 },

    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 22,
      backgroundColor: colors.primary,
    },
    saveButtonText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 9 },

    deleteButton: { alignItems: 'center', paddingVertical: 16 },
    deleteButtonText: { fontSize: 13.5, fontWeight: '700', color: colors.maroon },

    cancelButton: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 26,
      marginTop: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    cancelButtonText: { fontSize: 14, fontWeight: '700', color: colors.text },
  });
