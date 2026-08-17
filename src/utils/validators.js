// Reglas que exige el backend (ver esquemas ClientRegisterRequest / RecoveryNewPasswordRequest en Swagger)
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9-]{8,12}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,20}$/;

export const PASSWORD_HINT =
  'La contraseña debe tener 8-20 caracteres, con mayúscula, minúscula, número y un carácter especial (@$!%*?&#._-).';

// Filtros para usarse en onChangeText: bloquean el caracter no permitido al
// momento de escribir, en vez de solo avisar hasta que se envía el formulario.
export const filterDigits = (text) => text.replace(/\D/g, '');
export const filterPhoneChars = (text) => text.replace(/[^\d-]/g, '');
export const filterDecimal = (text) => {
  const cleaned = text.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
};
