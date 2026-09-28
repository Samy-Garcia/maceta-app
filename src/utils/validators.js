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

// Filtros de nombres: bloquean números y símbolos mientras se escribe, para
// que no haya que esperar al "guardar" para enterarse. Dejan pasar letras
// con tilde, ñ y espacios; los apellidos compuestos llevan apóstrofo y guion.
// Deja pasar exactamente lo mismo que acepta NAME_REGEX (y que exige el
// backend): letras con tilde, ñ y espacios. Si el filtro permitiera algo más,
// el campo se vería correcto y el servidor lo rechazaría al guardar.
export const filterName = (text) =>
  text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').replace(/\s{2,}/g, ' ');

// Códigos de referido y cupones: el backend los genera como M503-A1B2C3
export const filterCode = (text) => text.toUpperCase().replace(/[^A-Z0-9-]/g, '');

// Una tarjeta vencida no sirve para nada: MM/AA contra el mes actual
export function isExpiryExpired(expiry) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!match) return false;
  const [, month, year] = match;
  const now = new Date();
  // Vale todo el mes indicado: vence al terminar ese mes
  const lastDay = new Date(2000 + Number(year), Number(month), 0, 23, 59, 59);
  return lastDay < now;
}

// Largos máximos, para que nadie pegue un texto interminable en un campo
export const MAX_LENGTHS = {
  name: 50,
  email: 100,
  phone: 12,
  address: 150,
  code: 20,
  comment: 500,
};
