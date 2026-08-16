// Reglas que exige el backend (ver esquemas ClientRegisterRequest / RecoveryNewPasswordRequest en Swagger)
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9-]{8,12}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,20}$/;

export const PASSWORD_HINT =
  'La contraseña debe tener 8-20 caracteres, con mayúscula, minúscula, número y un carácter especial (@$!%*?&#._-).';
