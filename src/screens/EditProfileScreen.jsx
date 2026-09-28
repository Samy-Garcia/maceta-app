import {
  ActivityIndicator,
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
import BottomTabBar from '../components/BottomTabBar.jsx';
import Avatar from '../components/Avatar.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useEditProfile } from '../hooks/useEditProfile.jsx';
import { filterPhoneChars } from '../utils/validators.js';
import { tierIcon } from '../utils/loyaltyTiers.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatBirthDate, MAX_BIRTH_DATE, MIN_BIRTH_DATE } from '../utils/birthDate.js';

export default function EditProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    name, setName, lastName, setLastName, phone, setPhone, email,
    birthDate, setBirthDate, pickerOpen, setPickerOpen,
    place, tier, defaultAddress,
    photoUri, existingPhoto, isDirty, discard,
    saving, error,
    pickFromCamera, pickFromGallery, clearPickedPhoto, handleSave,
  } = useEditProfile(navigation);

  const previewUri = photoUri || existingPhoto;
  const fullName = [name, lastName].filter(Boolean).join(' ');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <Avatar size={34} uri={previewUri} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.overline}>MI CUENTA · ATELIER</Text>
        <Text style={styles.title}>Editar perfil</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar size={116} uri={previewUri} />
            <TouchableOpacity style={styles.cameraBadge} onPress={pickFromGallery} activeOpacity={0.85}>
              <Ionicons name="camera" size={15} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{fullName || 'Tu nombre'}</Text>
          {place ? <Text style={styles.place}>{place}</Text> : null}

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={pickFromCamera} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={15} color={colors.text} />
              <Text style={styles.photoButtonText}>Hacer foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={15} color={colors.text} />
              <Text style={styles.photoButtonText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoButton, styles.photoButtonIcon, !photoUri && styles.photoButtonMuted]}
              onPress={clearPickedPhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={15} color={colors.maroon} />
            </TouchableOpacity>
          </View>
        </View>

        {tier?.key ? (
          <View style={styles.tierCard}>
            <View style={styles.tierIcon}>
              <Ionicons name={tierIcon(tier.key)} size={18} color={colors.primary} />
            </View>
            <View style={styles.tierTexts}>
              <Text style={styles.tierTitle}>Colección botánica personal</Text>
              <Text style={styles.tierNote}>
                Vinculada al programa de fidelidad · {tier.points} hojas
              </Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tier.key}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>INFORMACIÓN GENERAL</Text>
          <Text style={styles.sectionHint}>Requerido</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldHead}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <Ionicons name="person-outline" size={14} color={colors.placeholder} />
          </View>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={50}
            placeholder="Tu nombre"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />

          <View style={styles.fieldHead}>
            <Text style={styles.fieldLabel}>Apellidos</Text>
            <Ionicons name="id-card-outline" size={14} color={colors.placeholder} />
          </View>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            maxLength={50}
            placeholder="Tus apellidos"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />

          <View style={styles.fieldHead}>
            <Text style={styles.fieldLabel}>Teléfono de contacto</Text>
            <Text style={styles.fieldHint}>Móvil / WhatsApp</Text>
          </View>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Ionicons name="call-outline" size={14} color={colors.placeholder} />
              <Text style={styles.phonePrefixText}>SV (+503)</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(text) => setPhone(filterPhoneChars(text))}
              placeholder="7000-0000"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>

          <View style={styles.fieldHead}>
            <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
            <Text style={styles.fieldHint}>Bono de cumpleaños</Text>
          </View>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={15} color={colors.placeholder} />
            <Text style={[styles.dateValue, !birthDate && styles.datePlaceholder]}>
              {birthDate ? formatBirthDate(birthDate) : 'Agregar tu fecha de nacimiento'}
            </Text>
            <Ionicons name="chevron-forward" size={15} color={colors.placeholder} />
          </TouchableOpacity>
          <Text style={styles.fieldNote}>
            Con tu fecha activas el bono de 100 hojas que se regala el día de tu cumpleaños.
          </Text>

          {pickerOpen ? (
            <DateTimePicker
              value={birthDate || new Date(1998, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={MAX_BIRTH_DATE}
              minimumDate={MIN_BIRTH_DATE}
              onChange={(event, selected) => {
                // En Android el selector se cierra solo; en iOS queda abierto
                if (Platform.OS === 'android') setPickerOpen(false);
                if (event.type === 'dismissed') return;
                if (selected) setBirthDate(selected);
              }}
            />
          ) : null}
          <View style={styles.fieldHead}>
            <Text style={styles.fieldLabel}>Correo electrónico</Text>
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          </View>
          <View style={styles.lockedRow}>
            <Ionicons name="mail-outline" size={15} color={colors.placeholder} />
            <Text style={styles.lockedValue} numberOfLines={1}>{email}</Text>
            <Ionicons name="lock-closed" size={14} color={colors.placeholder} />
          </View>
          <Text style={styles.fieldNote}>
            Es el correo con el que verificaste tu cuenta y al que llegan las confirmaciones de pedido.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>DIRECCIÓN Y ACCESOS RÁPIDOS</Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              navigation.navigate('EditLocation', defaultAddress ? { address: defaultAddress } : undefined)
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="location-outline" size={17} color={colors.primary} />
            </View>
            <View style={styles.linkTexts}>
              <View style={styles.linkTitleRow}>
                <Text style={styles.linkTitle}>Dirección de entrega</Text>
                {defaultAddress?.isDefault ? (
                  <View style={styles.mainPill}>
                    <Text style={styles.mainPillText}>PRINCIPAL</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.linkNote} numberOfLines={1}>
                {defaultAddress
                  ? [defaultAddress.addressLine, defaultAddress.municipality].filter(Boolean).join(', ')
                  : 'Agrega tu dirección de entrega'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, styles.linkDivider]}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
            </View>
            <View style={styles.linkTexts}>
              <Text style={styles.linkTitle}>Seguridad</Text>
              <Text style={styles.linkNote}>Cambiar tu contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, styles.linkDivider]}
            onPress={() => navigation.navigate('AddressList')}
            activeOpacity={0.7}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="bookmark-outline" size={17} color={colors.primary} />
            </View>
            <View style={styles.linkTexts}>
              <Text style={styles.linkTitle}>Mis direcciones</Text>
              <Text style={styles.linkNote}>Ver y editar todas tus direcciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        <ErrorText message={error} />

        <TouchableOpacity
          style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || !isDirty}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={17} color={colors.white} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardButton}
          onPress={discard}
          disabled={!isDirty || saving}
        >
          <Text style={[styles.discardText, !isDirty && styles.discardTextMuted]}>
            Descartar cambios
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerBrand}>MACETAS503 · ALFARERÍA Y BOTÁNICA SALVADOREÑA</Text>
        <Text style={styles.footerNote}>
          Tus datos viajan cifrados por HTTPS entre la app y el taller.
        </Text>
      </ScrollView>

      <BottomTabBar active="Perfil" />
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

    content: { paddingHorizontal: 20, paddingBottom: 26 },

    overline: { fontSize: 9.5, letterSpacing: 1.6, fontWeight: '700', color: colors.placeholder },
    title: { fontFamily: SERIF, fontSize: 27, fontWeight: '700', color: colors.text, marginTop: 6 },

    avatarSection: { alignItems: 'center', marginTop: 22 },
    avatarWrapper: { width: 116, height: 116 },
    cameraBadge: {
      position: 'absolute',
      right: 0,
      bottom: 4,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: isDark ? colors.background : '#F6F7F5',
    },
    name: {
      fontFamily: SERIF,
      fontSize: 21,
      fontWeight: '700',
      color: colors.text,
      marginTop: 14,
      textAlign: 'center',
    },
    place: { fontSize: 12.5, color: colors.placeholder, marginTop: 3 },

    photoActions: { flexDirection: 'row', marginTop: 16 },
    photoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginHorizontal: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    photoButtonIcon: { paddingHorizontal: 13 },
    photoButtonMuted: { opacity: 0.55 },
    photoButtonText: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginLeft: 7 },

    tierCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 14,
      marginTop: 24,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    tierIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    tierTexts: { flex: 1, marginRight: 10 },
    tierTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    tierNote: { fontSize: 11.5, color: colors.placeholder, marginTop: 3 },
    tierBadge: {
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    tierBadgeText: { fontSize: 10.5, fontWeight: '700', color: colors.primary },

    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionLabel: {
      fontSize: 9.5,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: colors.placeholder,
      marginTop: 26,
      marginBottom: 10,
    },
    sectionHint: { fontSize: 11, color: colors.placeholder, marginTop: 26, marginBottom: 10 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    fieldHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
      marginBottom: 8,
    },
    fieldLabel: { fontSize: 13.5, fontWeight: '600', color: colors.text },
    fieldHint: { fontSize: 11, fontWeight: '600', color: colors.placeholder },
    fieldNote: { fontSize: 11, lineHeight: 16, color: colors.placeholder, marginTop: 10 },
    input: {
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.text,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
      marginBottom: 6,
    },

    phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    phonePrefix: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      paddingHorizontal: 12,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      backgroundColor: isDark ? colors.card : '#E8EBE8',
    },
    phonePrefixText: { fontSize: 12, fontWeight: '700', color: colors.placeholder, marginLeft: 6 },
    phoneInput: {
      flex: 1,
      height: 50,
      paddingHorizontal: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
    },

    verifiedPill: { flexDirection: 'row', alignItems: 'center' },
    verifiedText: { fontSize: 11, fontWeight: '700', color: colors.primary, marginLeft: 4 },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
    },
    dateValue: { flex: 1, fontSize: 15, color: colors.text, marginHorizontal: 10 },
    datePlaceholder: { color: colors.placeholder },
    lockedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: isDark ? colors.card : '#F1F3F1',
    },
    lockedValue: { flex: 1, fontSize: 14.5, color: colors.placeholder, marginHorizontal: 10 },

    linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    linkDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    linkIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    linkTexts: { flex: 1, marginRight: 8 },
    linkTitleRow: { flexDirection: 'row', alignItems: 'center' },
    linkTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 },
    mainPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    mainPillText: { fontSize: 8, letterSpacing: 0.6, fontWeight: '700', color: colors.primary },
    linkNote: { fontSize: 12, color: colors.placeholder, marginTop: 3 },

    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 24,
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: { opacity: 0.45 },
    saveButtonText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 9 },

    discardButton: { alignItems: 'center', paddingVertical: 16 },
    discardText: { fontSize: 13.5, fontWeight: '700', color: colors.text },
    discardTextMuted: { color: colors.placeholder },

    footerBrand: {
      fontSize: 9.5,
      letterSpacing: 1.2,
      fontWeight: '700',
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 10,
    },
    footerNote: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 6,
      opacity: 0.8,
    },
  });
