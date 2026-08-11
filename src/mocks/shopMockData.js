// Datos locales
// y aqui estan las pantallas de inicio a lista de deseos que la voy actualizar mas adelante

export const mockCategories = ['Tiny Pots', 'Season Shapes', 'Geo Concret'];

export const mockPopularProducts = [
  {
    id: '1',
    name: 'Mini-8',
    dimensions: '4.5 x 5.5 x 6 cm',
    price: 1.25,
    favorite: true,
    image: require('../../assets/products/geo-candle-pastel.png'),
  },
  {
    id: '2',
    name: 'Mini-8',
    dimensions: '4.5 x 5.5 x 6 cm',
    price: 1.25,
    favorite: true,
    image: require('../../assets/products/pumpkin-jar.png'),
  },
  {
    id: '3',
    name: 'Mini-8',
    dimensions: '4.5 x 5.5 x 6 cm',
    price: 1.25,
    favorite: false,
    image: require('../../assets/products/flower-candle.png'),
  },
  {
    id: '4',
    name: 'Mini-8',
    dimensions: '4.5 x 5.5 x 6 cm',
    price: 1.25,
    favorite: false,
    image: require('../../assets/products/geo-candles-wood.png'),
  },
];

export const mockAddresses = [
  {
    id: 'a1',
    label: 'Casa',
    lines: ['Av. Juan Pablo II 105, Local 4B', 'Col. Escalón, San Salvador', 'San Salvador, 1101'],
    phone: '+503 7123 4567',
    isPrimary: true,
  },
  {
    id: 'a2',
    label: 'Oficina',
    lines: ['Torre Futura, Nivel 12, Oficina 1204', 'Calle El Mirador y 87 Av. Norte', 'Col. Escalón, San Salvador', 'CP 1101'],
    phone: '+503 7123 4567',
    isPrimary: false,
  },
];

export const mockSavedLocation = {
  label: 'Dirección Guardada',
  place: 'Apopa, San Salvador',
};

export const mockWishlistResults = [
  {
    id: 'w1',
    name: 'Concrete Candle Moon',
    rating: 3,
    price: 2,
    image: require('../../assets/products/moon-candles.png'),
  },
  {
    id: 'w2',
    name: 'Moon Astronaut Figure',
    rating: 3,
    price: 8,
    image: require('../../assets/products/astronaut.png'),
  },
  {
    id: 'w3',
    name: 'Hex Concrete Planter',
    rating: 3,
    price: 19.99,
    image: require('../../assets/products/succulent-hex.png'),
  },
  {
    id: 'w4',
    name: 'Guadalupe Candle',
    rating: 3,
    price: 45.0,
    image: require('../../assets/products/virgin-candle.png'),
  },
  {
    id: 'w5',
    name: 'Concrete Cylinder Candle',
    rating: 3,
    price: 22.5,
    image: require('../../assets/products/cylinder-candle.png'),
  },
  {
    id: 'w6',
    name: 'Paw Print Candle Set',
    rating: 3,
    price: 55.0,
    image: require('../../assets/products/paw-candles.png'),
  },
];

export const mockMapLocation = {
  label: 'Ubicación seleccionada',
  place: 'Apopa, San Salvador',
  latitude: 13.7167,
  longitude: -89.1781,
};
