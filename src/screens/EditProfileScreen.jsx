import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useEditProfile } from '../hooks/useEditProfile.jsx';
import { filterPhoneChars } from '../utils/validators.js';

export default function EditProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    fullName, setFullName, phone, setPhone, email,
    photoUri, existingPhoto, saving, error,
    pickFromCamera, pickFromGallery, handleSave,
  } = useEditProfile(navigation);

  const previewUri = photoUri || existingPhoto;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color={colors.white} />
            )}
            <TouchableOpacity style={styles.cameraBadge} onPress={pickFromGallery}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.changePhotoText}>Cambiar foto</Text>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.photoActionText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickFromGallery}>
              <Ionicons name="image-outline" size={16} color={colors.primary} />
              <Text style={styles.photoActionText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ingresa tu nombre completo"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(filterPhoneChars(text))}
          placeholder="Ej. 503-7777-8888"
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          maxLength={12}
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />

        <ErrorText message={error} />

        <Button label="Guardar Cambios" onPress={handleSave} loading={saving} />
      </ScrollView>

      <BottomTabBar active="Perfil" />
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
    content: { padding: 20, paddingBottom: 24 },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatarWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.accentPink,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: colors.shopBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    changePhotoText: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 14 },
    photoActions: { flexDirection: 'row', marginTop: 12 },
    photoActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 18,
      marginHorizontal: 6,
    },
    photoActionText: { color: colors.primary, fontWeight: '600', fontSize: 13, marginLeft: 6 },
    label: { fontSize: 13, color: colors.placeholder, marginBottom: 6, marginTop: 14 },
    input: {
      width: '100%',
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputDisabled: { color: colors.placeholder },
  });
