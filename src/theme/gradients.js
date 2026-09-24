// Degradado de fondo compartido por la bienvenida y las pantallas de
// autenticación, para que todo el flujo de entrada se vea como una sola pieza.
export const lightBackdrop = ['#E4F0E7', '#FAFDFB', '#E2EFE6'];
export const darkBackdrop = ['#101A14', '#171012', '#101A14'];

export const backdropFor = (isDark) => (isDark ? darkBackdrop : lightBackdrop);
