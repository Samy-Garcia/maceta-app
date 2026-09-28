import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { addAddress, updateAddress } from '../services/addresses.js';
import { filterName, filterPhoneChars, NAME_REGEX, PHONE_REGEX } from '../utils/validators.js';
import { useToast } from '../context/ToastContext.jsx';

// Formulario de dirección, escrito a mano. Sirve para las dos cosas:
// crear una nueva (POST /api/loginClient/me/addresses) cuando no se recibe
// ninguna, o editar la que venga (PUT .../addresses/:id).
export function useEditLocation(navigation, address) {
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const isEditing = !!address?._id;
  const [fullName, setFullName] = useState(
    address?.fullName ?? [user?.name, user?.lastName].filter(Boolean).join(' ')
  );
  const [addressLine, setAddressLine] = useState(address?.addressLine ?? '');
  const [municipality, setMunicipality] = useState(address?.municipality ?? '');
  const [department, setDepartment] = useState(address?.department ?? '');
  const [phone, setPhone] = useState(address?.phone ?? user?.phone ?? '');
  // La primera dirección de la cuenta entra como predeterminada
  const [isDefault, setIsDefault] = useState(
    address?.isDefault ?? !(user?.addresses?.length > 0)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // El nombre de quien recibe y el municipio/departamento son nombres:
  // se filtran mientras se escribe para no descubrirlo al guardar.
  const handleNameChange = (text) => setFullName(filterName(text));
  const handleMunicipalityChange = (text) => setMunicipality(filterName(text));
  const handleDepartmentChange = (text) => setDepartment(filterName(text));
  const handlePhoneChange = (text) => setPhone(filterPhoneChars(text));

  const handleSave = async () => {
    setError('');
    if (!fullName.trim() || !addressLine.trim() || !municipality.trim() || !department.trim() || !phone.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    if (!NAME_REGEX.test(fullName.trim())) {
      setError('El nombre de quien recibe solo debe contener letras.');
      return;
    }
    if (addressLine.trim().length < 5) {
      setError('La dirección debe tener al menos 5 caracteres.');
      return;
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      setError('El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      addressLine: addressLine.trim(),
      municipality: municipality.trim(),
      department: department.trim(),
      phone: phone.trim(),
      isDefault,
    };

    setSaving(true);
    try {
      if (isEditing) await updateAddress(address._id, payload);
      else await addAddress(payload);
      await refreshUser();
      toast.success(
        isEditing ? 'Dirección actualizada' : 'Dirección guardada',
        isEditing ? 'Tus cambios se guardaron correctamente.' : 'Ya puedes usarla en tus pedidos.'
      );
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditing,
    fullName, setFullName: handleNameChange,
    addressLine, setAddressLine,
    municipality, setMunicipality: handleMunicipalityChange,
    department, setDepartment: handleDepartmentChange,
    phone, setPhone: handlePhoneChange,
    isDefault, setIsDefault,
    saving, error, handleSave,
  };
}
