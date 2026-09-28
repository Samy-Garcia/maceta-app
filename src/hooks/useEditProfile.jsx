import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../services/api.js';
import { fetchMyLoyalty } from '../services/loyalty.js';
import { useAuth } from '../context/AuthContext.jsx';
import { filterName, filterPhoneChars, NAME_REGEX, PHONE_REGEX } from '../utils/validators.js';
import { resolveTier } from '../utils/loyaltyTiers.js';
import { fileToUploadBlob } from '../utils/fileToBlob.js';
import { BIRTH_DATE_SEND_KEYS, readBirthDate, toISODate } from '../utils/birthDate.js';
import { useToast } from '../context/ToastContext.jsx';

// edición del perfil del cliente (PUT /api/loginClient/me)
export function useEditProfile(navigation) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthDate, setBirthDate] = useState(() => readBirthDate(user));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState(null); // solo se llena si el usuario elige una foto nueva
  const [photoAsset, setPhotoAsset] = useState(null);
  const [tier, setTier] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Nivel real del programa de lealtad, para la tarjeta de "colección"
  useEffect(() => {
    fetchMyLoyalty()
      .then((data) => {
        const points = data?.points ?? 0;
        // Si el servidor todavía no manda 'tier', se calcula con la misma
        // tabla de niveles que usa la pantalla de lealtad.
        setTier({ key: data?.tier || resolveTier(points).current.key, points });
      })
      .catch(() => setTier(null));
  }, []);

  const addresses = user?.addresses || [];
  const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
  const place = defaultAddress
    ? [defaultAddress.municipality, defaultAddress.department].filter(Boolean).join(', ')
    : '';


  const isDirty =
    name !== (user?.name ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    phone !== (user?.phone ?? '') ||
    // Se comparan los tiempos: son objetos Date distintos aunque valgan igual
    birthDate?.getTime() !== readBirthDate(user)?.getTime() ||
    !!photoUri;

  const handleNameChange = (text) => setName(filterName(text));
  const handleLastNameChange = (text) => setLastName(filterName(text));
  const handlePhoneChange = (text) => setPhone(filterPhoneChars(text));

  const discard = () => {
    setName(user?.name ?? '');
    setLastName(user?.lastName ?? '');
    setPhone(user?.phone ?? '');
    setBirthDate(readBirthDate(user));
    setPhotoUri(null);
    setPhotoAsset(null);
    setError('');
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.warning('Permiso necesario', 'Activa el permiso de cámara para tomar una foto de perfil.');
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
      setPhotoAsset(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.warning('Permiso necesario', 'Activa el permiso de galería para elegir una foto de perfil.');
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
      setPhotoAsset(result.assets[0]);
    }
  };

  // Descarta la foto recién elegida y deja la que ya tenía la cuenta. Quitar
  // del todo la foto guardada necesitaría que el backend acepte borrarla.
  const clearPickedPhoto = () => {
    if (!photoUri) {
      toast.info(
        'Sin foto nueva',
        user?.photo
          ? 'Esta es la foto guardada en tu cuenta. Elige una nueva con la cámara o la galería.'
          : 'Todavía no has elegido una foto.'
      );
      return;
    }
    setPhotoUri(null);
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim() || !lastName.trim()) {
      setError('Ingresa tu nombre y tus apellidos.');
      return;
    }
    if (!NAME_REGEX.test(name.trim()) || !NAME_REGEX.test(lastName.trim())) {
      setError('Nombre y apellidos solo deben contener letras (2-50 caracteres).');
      return;
    }
    if (phone && !PHONE_REGEX.test(phone.trim())) {
      setError('El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('lastName', lastName.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (birthDate) {
        const iso = toISODate(birthDate);
        BIRTH_DATE_SEND_KEYS.forEach((key) => formData.append(key, iso));
      }
      if (photoUri) {
        const fileName = photoAsset?.fileName || photoUri.split('/').pop() || 'photo.jpg';
        // El selector ya dice el tipo real del archivo; la extensión del
        // nombre es solo el respaldo por si no viene.
        const extMatch = /\.(\w+)$/.exec(fileName);
        const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        const mimeType = photoAsset?.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        // Va como Blob, no como { uri }: el fetch de Expo no sabe serializar
        // las partes con uri de React Native (ver utils/fileToBlob.js).
        // Se separa del envío para poder decir en qué paso falló.
        let blob;
        try {
          blob = await fileToUploadBlob(photoUri, mimeType);
        } catch (readError) {
          throw new Error(readError.message || 'No se pudo preparar la imagen para subirla.');
        }
        formData.append('photo', blob, fileName);
      }

      await apiFetch('/api/loginClient/me', { method: 'PUT', body: formData });
      await refreshUser();
      toast.success('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return {
    name,
    setName: handleNameChange,
    lastName,
    setLastName: handleLastNameChange,
    phone,
    setPhone: handlePhoneChange,
    birthDate,
    setBirthDate,
    pickerOpen,
    setPickerOpen,
    email: user?.email ?? '',
    place,
    tier,
    defaultAddress,
    photoUri,
    existingPhoto: user?.photo ?? null,
    isDirty,
    discard,
    saving,
    error,
    pickFromCamera,
    pickFromGallery,
    clearPickedPhoto,
    handleSave,
  };
}
