# Expo HAS CHANGED

Este proyecto está en **Expo SDK 57** (React Native 0.86, React 19.2).

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Notas de la migración 54 → 57:

- La New Architecture y edge-to-edge son obligatorias: `newArchEnabled` y
  `android.edgeToEdgeEnabled` ya no existen en el esquema de `app.json`.
- El bloque `splash` de `app.json` se migró al plugin `expo-splash-screen`.
- Desde SDK 56 el `fetch` global es `expo/fetch`. La sesión de la app viaja en
  la cookie httpOnly `authCookie` (ver `src/services/api.js`); si la sesión
  deja de persistir, `EXPO_PUBLIC_USE_RN_FETCH=1` vuelve al fetch de RN.
- `@expo/vector-icons` sigue funcionando pero quedó deprecado a favor de
  `@react-native-vector-icons/*`.
