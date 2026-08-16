import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { NAME_REGEX, PHONE_REGEX } from '../utils/validators.js';

// edición del perfil del cliente (PUT /api/loginClient/me)
export function useEditProfile(navigation) {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState([user?.name, user?.lastName].filter(Boolean).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [photoUri, setPhotoUri] = useState(null); // solo se llena si el usuario elige una foto nueva
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el permiso de cámara para tomar una foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el permiso de galería para elegir una foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!fullName.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (!NAME_REGEX.test(fullName.trim())) {
      setError('El nombre solo debe contener letras.');
      return;
    }
    if (phone && !PHONE_REGEX.test(phone.trim())) {
      setError('El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).');
      return;
    }

    // El backend guarda nombre y apellido por separado; el diseño solo pide
    // un campo, así que la primera palabra es el nombre y el resto el apellido.
    const parts = fullName.trim().split(/\s+/);
    const name = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : user?.lastName ?? '';

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('lastName', lastName);
      if (phone.trim()) formData.append('phone', phone.trim());
      if (photoUri) {
        const fileName = photoUri.split('/').pop() || 'photo.jpg';
        const extMatch = /\.(\w+)$/.exec(fileName);
        const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        formData.append('photo', {
          uri: photoUri,
          name: fileName,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });
      }

      await apiFetch('/api/loginClient/me', { method: 'PUT', body: formData });
      await refreshUser();
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return {
    fullName,
    setFullName,
    phone,
    setPhone,
    email: user?.email ?? '',
    photoUri,
    existingPhoto: user?.photo ?? null,
    saving,
    error,
    pickFromCamera,
    pickFromGallery,
    handleSave,
  };
}
