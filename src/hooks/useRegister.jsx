import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import {
  EMAIL_REGEX,
  filterCode,
  filterName,
  NAME_REGEX,
  PASSWORD_HINT,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from '../utils/validators.js';
import { useGoogleAuth } from './useGoogleAuth.jsx';

// formulario de creación de cuenta (POST /api/registerClient -> envía código de verificación al correo)
export function useRegister(navigation) {
  const google = useGoogleAuth(navigation);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (text) => setName(filterName(text));
  const handleLastNameChange = (text) => setLastName(filterName(text));
  const handleReferralChange = (text) => setReferralCode(filterCode(text));

  const validate = () => {
    if (!name || !lastName || !email || !phone || !address || !password || !confirmPassword) {
      return 'Completa todos los campos obligatorios.';
    }
    if (!NAME_REGEX.test(name.trim()) || !NAME_REGEX.test(lastName.trim())) {
      return 'Nombre y apellido solo deben contener letras (2-50 caracteres).';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      return 'El teléfono debe tener entre 8 y 12 dígitos (puede incluir guiones).';
    }
    if (address.trim().length < 5) {
      return 'La dirección debe tener al menos 5 caracteres.';
    }
    if (!PASSWORD_REGEX.test(password)) {
      return PASSWORD_HINT;
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }
    return '';
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('lastName', lastName.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      if (referralCode.trim()) formData.append('referralCode', referralCode.trim());

      await apiFetch('/api/registerClient', { method: 'POST', body: formData });
      navigation.navigate('Verification', { flow: 'register', email: email.trim() });
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => navigation.navigate('Login');
  // Mismo flujo que el login: si la cuenta de Google no existe, el backend la crea
  const handleGoogleRegister = google.signIn;

  return {
    name,
    setName: handleNameChange,
    lastName,
    setLastName: handleLastNameChange,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    referralCode,
    setReferralCode: handleReferralChange,
    loading,
    error,
    handleRegister,
    goToLogin,
    handleGoogleRegister,
    googleLoading: google.loading,
  };
}
