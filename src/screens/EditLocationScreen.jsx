import {
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
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useEditLocation } from '../hooks/useEditLocation.jsx';

// Formulario de dirección: escrito a mano, sin mapa (la app ya no lo usa en
// ningún lado). Solo los campos reales que guarda el backend.
export default function EditLocationScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const address = route?.params?.address;
  const {
    isEditing,
    fullName, setFullName, addressLine, setAddressLine, municipality, setMunicipality,
    department, setDepartment, phone, setPhone, isDefault, setIsDefault, saving, error, handleSave,
  } = useEditLocation(navigation, address);

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
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Ionicons name="location-outline" size={11} color={colors.primary} />
            <Text style={styles.pillText}>DIRECCIÓN ESCRITA A MANO</Text>
          </View>
        </View>

        <Text style={styles.title}>{isEditing ? 'Editar dirección' : 'Nueva dirección'}</Text>
        <Text style={styles.subtitle}>
          Estos datos se usan para calcular tu envío y para que el taller sepa a dónde llevar tu pedido.
        </Text>

        <Text style={styles.label}>Persona que recibe</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={16} color={colors.placeholder} />
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            maxLength={50}
            placeholder="Nombre y apellido"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />
        </View>

        <Text style={styles.label}>Dirección completa</Text>
        <View style={[styles.inputRow, styles.inputRowMultiline]}>
          <Ionicons name="home-outline" size={16} color={colors.placeholder} style={styles.inputIconTop} />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={addressLine}
            onChangeText={setAddressLine}
            maxLength={150}
            placeholder="Calle, número de casa, colonia y punto de referencia"
            placeholderTextColor={colors.placeholder}
            multiline
          />
        </View>

        <View style={styles.doubleRow}>
          <View style={styles.doubleCol}>
            <Text style={styles.label}>Municipio</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={municipality}
                onChangeText={setMunicipality}
                maxLength={50}
                placeholder="San Salvador"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
          <View style={styles.doubleCol}>
            <Text style={styles.label}>Departamento</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={setDepartment}
                maxLength={50}
                placeholder="San Salvador"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        </View>

        <Text style={styles.label}>Teléfono de contacto</Text>
        <View style={styles.inputRow}>
          <View style={styles.phonePrefix}>
            <Ionicons name="call-outline" size={14} color={colors.placeholder} />
            <Text style={styles.phonePrefixText}>SV +503</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="7000-0000"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            maxLength={12}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchIcon}>
            <Ionicons name="star" size={15} color={colors.primary} />
          </View>
          <View style={styles.switchTexts}>
            <Text style={styles.switchTitle}>Dirección principal</Text>
            <Text style={styles.switchNote}>Es la que se usa primero al pagar</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <ErrorText message={error} />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={17} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar dirección'}
          </Text>
        </TouchableOpacity>

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
    subtitle: { fontSize: 12.5, lineHeight: 19, color: colors.placeholder, marginTop: 6 },

    label: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor: isDark ? colors.surface : '#F1F3F1',
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
    },
    inputRowMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
    inputIconTop: { marginTop: 3 },
    input: { flex: 1, marginLeft: 10, fontSize: 14.5, color: colors.text, padding: 0 },
    inputMultiline: { minHeight: 60, textAlignVertical: 'top' },

    doubleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    doubleCol: { width: '48%' },

    phonePrefix: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    phonePrefixText: { fontSize: 12, fontWeight: '700', color: colors.placeholder, marginLeft: 5 },

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

    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
      borderRadius: 28,
      marginTop: 22,
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 9 },

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
