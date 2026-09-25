<img width="3780" height="1890" alt="589306282-8d3ae46a-81c8-41ed-ac48-7ee2fea3d2f1" src="https://github.com/user-attachments/assets/49532a9a-9208-4ddd-8fa0-1190339ff496" />

# 🌱 MACETAS 503 — App Móvil

Aplicación móvil (cliente) de la tienda en línea Macetas503, construida con React Native + Expo. Consume la misma API que la tienda web, permitiendo comprar macetas, velas y plantas, gestionar direcciones con envío calculado por distancia real, y participar en el programa de fidelidad, todo desde el celular.

Este repositorio es la contraparte móvil del proyecto principal [MACETAS 503](#), que además incluye el backend (Node.js + Express + MongoDB), la tienda web (React + Vite) y el panel administrativo (React + Vite).

---

# Características

- Inicio de sesión y registro de clientes, con verificación por código enviado por correo.
- Recuperación de contraseña mediante código de verificación.
- Catálogo de macetas, velas y plantas con filtros y detalle de producto.
- Wishlist de productos.
- Carrito de compras y checkout, con selección de dirección en mapa interactivo (OpenStreetMap/Leaflet) y cálculo de envío por distancia real.
- Gestión de direcciones guardadas.
- Gestión de tarjetas guardadas (almacenadas localmente en el dispositivo; el backend aún no tiene endpoint para esto).
- Historial y detalle de pedidos.
- Programa de fidelidad: consulta de puntos/hojas acumuladas.
- Perfil de usuario editable.
- Pantallas de carga y splash con persistencia de sesión.

---

# Tecnologías utilizadas

- React Native + Expo (SDK 54)
- React Navigation (native stack)
- Context API (autenticación, carrito, tema)
- AsyncStorage (persistencia local: sesión, tarjetas guardadas, envío seleccionado)
- React Native WebView + Leaflet (mapa interactivo para seleccionar ubicación de envío)
- Expo Image Picker (foto de perfil)
- React Native Multi Slider (filtros de rango, ej. precio)
- Expo Linear Gradient
- Prop Types

---

# Estructura del proyecto

```
macetas-app
├── assets
│   └── products             # Imágenes de ejemplo de productos
│
├── src
│   ├── components            # Componentes reutilizables (botones, inputs, tarjetas, mapa, etc.)
│   ├── context                # AuthContext (sesión) y CartContext (carrito)
│   ├── hooks                  # Un hook por pantalla/funcionalidad (useLogin, useProducts, useCartScreen, etc.)
│   ├── navigation              # AppNavigator.jsx (stack de navegación)
│   ├── screens                 # Pantallas de la app
│   ├── services                 # Llamadas a la API y almacenamiento local, organizados por recurso
│   ├── theme                    # Colores, paletas y ThemeContext
│   ├── utils                     # Validadores y helpers (normalizeProduct, orderStatus, cardBrand)
│   └── vendor                     # Assets de Leaflet embebidos para el WebView del mapa
│
├── App.jsx                    # Punto de entrada: providers (Theme, SafeArea, Auth, Cart) + Navigation
├── app.json                   # Configuración de Expo
└── index.js
```

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd macetas-app
```

## 2. Instalar dependencias

```bash
npm install
```

---

# Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# URL del backend (API de Macetas503). En local, la IP de tu máquina en la
# red (no "localhost", ya que el celular/emulador no la resuelve igual) y en
# producción, la URL del backend en Render.
EXPO_PUBLIC_API_URL=
```

---

# Ejecutar el proyecto

```bash
npm start
```

Esto abre el bundler de Expo (Metro). Desde ahí se puede:

```bash
npm run android   # Abrir en un emulador/dispositivo Android
npm run ios       # Abrir en un simulador/dispositivo iOS
npm run web       # Abrir en el navegador (modo web de Expo)
```

También se puede escanear el código QR con la app **Expo Go** en un dispositivo físico, siempre que el celular y la computadora estén en la misma red y `EXPO_PUBLIC_API_URL` apunte a una URL accesible desde el celular (IP local o el backend ya desplegado).

---

# Notas técnicas

- La sesión se maneja con cookies (`credentials: 'include'` en cada petición), igual que en la tienda web — el backend debe tener CORS configurado para aceptar el origen desde el que corre la app.
- El cálculo de ruta/distancia para el envío usa el endpoint `/api/ruta` del backend (documentado como `/api/route` en Swagger, pero montado como `/api/ruta`).
- Las tarjetas guardadas se almacenan solo localmente con AsyncStorage: nunca se guarda el número completo ni el CVV, solo los últimos 4 dígitos.
- La información de envío seleccionada en el mapa se persiste en AsyncStorage para sobrevivir a recargas de la app (Fast Refresh, cierre/apertura, etc.).

---

# Convenciones de nomenclatura

- Pantallas y componentes (`.jsx`) → **PascalCase** (`LoginScreen.jsx`, `FormInput.jsx`).
- Hooks personalizados → **camelCase** con prefijo `use` (`useLogin.jsx`, `useCartScreen.jsx`).
- Servicios y utilidades → **camelCase** (`fetchRoute`, `normalizeProduct`, `getCards`).
- Funciones y variables → **camelCase** (`handleSubmit`, `fetchCatalog`).
- Componentes React (uso en JSX) → **PascalCase** (`<Button />`, `<OsmMapPicker />`).

---

# Equipo

Proyecto desarrollado como parte del Proyecto Técnico Científico (PTC) — Instituto Técnico Ricaldone, Tercer Año de Bachillerato, Especialidad de Desarrollo de Software.
