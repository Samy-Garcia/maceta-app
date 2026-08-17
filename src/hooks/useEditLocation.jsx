import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext.jsx';
import { updateAddress } from '../services/addresses.js';
import { PHONE_REGEX } from '../utils/validators.js';

// Edita una dirección real ya guardada (PUT /api/loginClient/me/addresses/:id)
export function useEditLocation(navigation, address) {
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState(address?.fullName ?? '');
  const [addressLine, setAddressLine] = useState(address?.addressLine ?? '');
  const [municipality, setMunicipality] = useState(address?.municipality ?? '');
  const [department, setDepartment] = useState(address?.department ?? '');
  const [phone, setPhone] = useState(address?.phone ?? '');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!fullName.trim() || !addressLine.trim() || !municipality.trim() || !department.trim() || !phone.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      setError('El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).');
      return;
    }

    setSaving(true);
    try {
      await updateAddress(address._id, {
        fullName: fullName.trim(),
        addressLine: addressLine.trim(),
        municipality: municipality.trim(),
        department: department.trim(),
        phone: phone.trim(),
        isDefault,
      });
      await refreshUser();
      Alert.alert('Dirección actualizada', 'Tus cambios se guardaron correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  return {
    fullName, setFullName,
    addressLine, setAddressLine,
    municipality, setMunicipality,
    department, setDepartment,
    phone, setPhone,
    isDefault, setIsDefault,
    saving, error, handleSave,
  };
}
