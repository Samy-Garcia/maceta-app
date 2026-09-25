// Fecha de nacimiento del cliente.
//
// El backend ya la usa (GET /api/loyalty/mine devuelve birthdayStatus, con
// 'no-date' cuando falta), pero su modelo no está expuesto públicamente y no
// se pudo confirmar desde fuera con qué nombre guarda el campo. Por eso:
//  - al LEER se acepta cualquiera de los nombres habituales;
//  - al GUARDAR se mandan los dos más probables, y el backend ignora el que
//    no exista en su esquema.
// Cuando confirmes el nombre real, deja solo ese en BIRTH_DATE_SEND_KEYS.
const BIRTH_DATE_KEYS = ['birthDate', 'birthday', 'dateOfBirth', 'fechaNacimiento'];
export const BIRTH_DATE_SEND_KEYS = ['birthDate', 'birthday'];

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Un cumpleaños es una fecha de calendario, no un instante: new Date("1998-03-15")
// se interpreta como medianoche UTC y en El Salvador (UTC-6) se leería como el
// 14 de marzo. Por eso las fechas sin hora se arman con componentes locales.
function parseCalendarDate(value) {
  if (typeof value === 'string') {
    const onlyDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (onlyDate) {
      const [, year, month, day] = onlyDate;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Devuelve la fecha que tenga el cliente, venga con el nombre que venga
export function readBirthDate(user) {
  for (const key of BIRTH_DATE_KEYS) {
    const value = user?.[key];
    if (!value) continue;
    const date = parseCalendarDate(value);
    if (date) return date;
  }
  return null;
}

// "15 de marzo de 1998"
export function formatBirthDate(date) {
  if (!date) return '';
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

// "15 de marzo" — para el bono, donde el año no importa
export function formatBirthDay(date) {
  if (!date) return '';
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

// Se manda en ISO corto armado con los componentes LOCALES: toISOString()
// convierte a UTC y volvería a correr el día en media parte del mundo.
export const toISODate = (date) =>
  date.getFullYear() +
  '-' +
  String(date.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(date.getDate()).padStart(2, '0');

// Rango razonable para el selector: nadie nace en el futuro
export const MAX_BIRTH_DATE = new Date();
export const MIN_BIRTH_DATE = new Date(1920, 0, 1);

// Cuántos días faltan para el próximo cumpleaños (0 = hoy)
export function daysUntilBirthday(date, now = new Date()) {
  if (!date) return null;
  const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}
