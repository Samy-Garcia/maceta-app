import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useEditLocation } from '../hooks/useEditLocation.jsx';
import { filterPhoneChars } from '../utils/validators.js';

export default function EditLocationScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const address = route?.params?.address;
  const {
    fullName, setFullName, addressLine, setAddressLine, municipality, setMunicipality,
    department, setDepartment, phone, setPhone, isDefault, setIsDefault, saving, error, handleSave,
  } = useEditLocation(navigation, address);

  if (!address) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Dirección</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.stateText}>No se encontró esta dirección.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Dirección</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>Dirección</Text>
        <TextInput style={styles.input} value={addressLine} onChangeText={setAddressLine} placeholderTextColor={colors.placeholder} />

        <View style={styles.rowFields}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Municipio</Text>
            <TextInput style={styles.input} value={municipality} onChangeText={setMunicipality} placeholderTextColor={colors.placeholder} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Departamento</Text>
            <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholderTextColor={colors.placeholder} />
          </View>
        </View>

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(filterPhoneChars(text))}
          keyboardType="phone-pad"
          maxLength={12}
          placeholderTextColor={colors.placeholder}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Usar como dirección principal</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <ErrorText message={error} />

        <Button label="Guardar Cambios" onPress={handleSave} loading={saving} />
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
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stateText: { fontSize: 13, color: colors.placeholder },
    content: { padding: 20, paddingBottom: 24 },
    label: { fontSize: 12, color: colors.placeholder, marginBottom: 6, marginTop: 14 },
    input: {
      height: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 14,
      color: colors.text, backgroundColor: colors.surface,
    },
    rowFields: { flexDirection: 'row', justifyContent: 'space-between' },
    halfField: { width: '48%' },
    switchRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 20, marginBottom: 8,
    },
    switchLabel: { fontSize: 13, color: colors.text, fontWeight: '600', flex: 1, marginRight: 12 },
  });
