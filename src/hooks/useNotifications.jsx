import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyOrders } from '../services/orders.js';
import { fetchMyLoyalty } from '../services/loyalty.js';
import { fetchOffers, fetchMacetas, fetchVelas, fetchOtros } from '../services/products.js';
import {
  DEFAULT_PREFS,
  getLocalEvents,
  getPrefs,
  getReadIds,
  savePrefs,
  saveReadIds,
} from '../services/notificationsStorage.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getStatusMeta } from '../utils/orderStatus.js';
import { isRecentlyAdded, normalizeProduct } from '../utils/normalizeProduct.js';

export const NOTIF_TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pedidos', label: 'Pedidos', icon: 'car-outline' },
  { key: 'seguridad', label: 'Seguridad', icon: 'shield-outline' },
  { key: 'novedades', label: 'Novedades', icon: 'sparkles-outline' },
  { key: 'club', label: 'Club', icon: 'leaf-outline' },
];

// Cómo se ve cada aviso según su tipo
export const KIND_STYLE = {
  pedidos: { icon: 'car', tone: 'maroon' },
  seguridad: { icon: 'shield-checkmark', tone: 'neutral' },
  novedades: { icon: 'flower', tone: 'primary' },
  club: { icon: 'leaf', tone: 'gold' },
  bienvenida: { icon: 'sparkles', tone: 'neutral' },
};

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// "Hace 20 min", "Ayer, 3:45 PM", "28 de mayo"
export function relativeLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const minutes = Math.floor((now - date) / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return 'Hace ' + minutes + ' min';

  const today = startOfDay(now);
  const day = startOfDay(date);
  const dayDiff = Math.round((today - day) / 86400000);
  const time = date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });

  if (dayDiff === 0) {
    const hours = Math.floor(minutes / 60);
    return 'Hace ' + hours + (hours === 1 ? ' hora' : ' horas');
  }
  if (dayDiff === 1) return 'Ayer, ' + time;
  return date.getDate() + ' de ' + MONTHS[date.getMonth()];
}

export function groupOf(dateStr) {
  const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(new Date(dateStr))) / 86400000);
  if (dayDiff <= 0) return 'HOY';
  if (dayDiff === 1) return 'AYER';
  return 'ANTERIORES';
}

// Bandeja de avisos. No hay endpoint de notificaciones en el backend: cada
// aviso se deriva de algo real (el estado de tus pedidos, tus hojas de
// lealtad, lo que entró al catálogo) o de un evento que la app registró.
export function useNotifications(navigation) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [fresh, setFresh] = useState([]);
  const [offers, setOffers] = useState([]);
  const [events, setEvents] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('todas');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchMyOrders().catch(() => []),
      fetchMyLoyalty().catch(() => null),
      fetchOffers().catch(() => []),
      fetchMacetas().catch(() => []),
      fetchVelas().catch(() => []),
      fetchOtros().catch(() => []),
      getReadIds(user?.email),
      getPrefs(user?.email),
      getLocalEvents(user?.email),
    ])
      .then(([ordersData, loyaltyData, offersData, macetas, velas, otros, read, storedPrefs, localEvents]) => {
        setOrders(ordersData || []);
        setLoyalty(loyaltyData);
        setOffers((offersData || []).filter((offer) => offer.status && offer.product));
        const catalog = [
          ...(macetas || []).map((item) => normalizeProduct(item, 'maceta')),
          ...(velas || []).map((item) => normalizeProduct(item, 'vela')),
          ...(otros || []).map((item) => normalizeProduct(item, 'otro')),
        ];
        setFresh(catalog.filter(isRecentlyAdded));
        setReadIds(read);
        setPrefs(storedPrefs);
        setEvents(localEvents || []);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Cada fuente real se convierte en avisos
  const all = useMemo(() => {
    const list = [];

    if (prefs.pedidos) {
      orders.forEach((order) => {
        const meta = getStatusMeta(order.status);
        const firstItem = order.products?.[0]?.product?.name;
        list.push({
          id: 'order-' + order._id + '-' + order.status,
          kind: 'pedidos',
          overline: 'ENTREGA LOCAL',
          title: 'Tu pedido ' + order.orderCode + ' — ' + meta.label.toLowerCase(),
          body: firstItem
            ? meta.kind === 'done'
              ? 'Entregamos ' + firstItem + '. Cuéntanos qué te pareció con una reseña.'
              : 'Tu pedido con ' + firstItem + ' está ' + meta.label.toLowerCase() + '.'
            : 'El estado de tu pedido cambió a ' + meta.label.toLowerCase() + '.',
          date: order.updatedAt || order.createdAt,
          tag: meta.label,
          action: { label: 'Ver pedido', route: 'OrderDetail', params: { order } },
        });
      });
    }

    if (prefs.club && loyalty) {
      (loyalty.history || []).slice(0, 5).forEach((entry) => {
        list.push({
          id: 'loyalty-' + entry.id,
          kind: 'club',
          overline: 'CLUB BOTÁNICO',
          title:
            (entry.amount >= 0 ? 'Sumaste +' : 'Usaste ') +
            Math.abs(entry.amount) +
            ' hojas verdes',
          body: entry.title,
          date: entry.date,
          tag: 'Balance: ' + (loyalty.points ?? 0) + ' hojas',
          action: { label: 'Ver mis hojas', route: 'LoyaltyPoints' },
        });
      });
    }

    if (prefs.novedades) {
      if (fresh.length) {
        const newest = [...fresh].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        list.push({
          id: 'fresh-' + newest[0].id,
          kind: 'novedades',
          overline: 'COLECCIÓN ARTESANAL',
          title:
            fresh.length === 1
              ? 'Nueva pieza: ' + newest[0].name
              : 'Entraron ' + fresh.length + ' piezas nuevas al catálogo',
          body: newest
            .slice(0, 3)
            .map((item) => item.name)
            .join(', '),
          date: newest[0].createdAt,
          action: { label: 'Ver catálogo', route: 'Products' },
        });
      }

      offers.slice(0, 3).forEach((offer) => {
        list.push({
          id: 'offer-' + offer._id,
          kind: 'novedades',
          overline: 'PRECIO ESPECIAL',
          title: offer.product.name + ' con ' + offer.discountPercentage + '% de descuento',
          body:
            'Queda en $' +
            Number(offer.discountedPrice).toFixed(2) +
            ' en lugar de $' +
            Number(offer.product.price).toFixed(2) +
            '.',
          date: offer.updatedAt || offer.createdAt,
          tag: '-' + offer.discountPercentage + '%',
          action: {
            label: 'Ver pieza',
            route: 'ProductDetail',
            params: {
              product: {
                id: offer.product._id,
                productType: offer.productType,
                name: offer.product.name,
                image: offer.product.image,
                price: offer.product.price,
                stock: offer.product.stock,
                discountedPrice: offer.discountedPrice,
                discountPercentage: offer.discountPercentage,
              },
            },
          },
        });
      });
    }

    events.forEach((event, index) => {
      if (event.kind === 'seguridad' && !prefs.seguridad) return;
      list.push({
        id: 'event-' + index + '-' + event.date,
        kind: event.kind || 'seguridad',
        overline: event.overline || 'CREDENCIALES',
        title: event.title,
        body: event.body,
        date: event.date,
        action: event.route ? { label: event.actionLabel, route: event.route } : undefined,
      });
    });

    if (user?.createdAt) {
      list.push({
        id: 'welcome-' + user.createdAt,
        kind: 'bienvenida',
        overline: 'BIENVENIDA',
        title: 'Bienvenido a Macetas503',
        body: 'Gracias por unirte al atelier botánico. Cada compra te suma hojas que puedes canjear por cupones.',
        date: user.createdAt,
        action: { label: 'Ver el programa', route: 'LoyaltyPoints' },
      });
    }

    // Una cuenta recién creada no tiene por qué estrenar la bandeja con
    // avisos de cosas que pasaron antes de que existiera: el catálogo y las
    // ofertas son muy anteriores a ella. Se queda solo la bienvenida, y a
    // partir de ahí van cayendo los avisos de lo que vaya ocurriendo —
    // sus pedidos, sus hojas, y las piezas y promos que entren desde hoy.
    const accountCreated = user?.createdAt ? new Date(user.createdAt) : null;

    return list
      .filter(
        (item) =>
          item.kind === 'bienvenida' ||
          !accountCreated ||
          new Date(item.date) >= accountCreated
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, loyalty, fresh, offers, events, prefs, user?.createdAt]);

  const unreadCount = all.filter((item) => !readIds.has(item.id)).length;

  const counts = useMemo(() => {
    const result = { todas: all.length };
    NOTIF_TABS.slice(1).forEach((t) => {
      result[t.key] = all.filter((item) => item.kind === t.key).length;
    });
    return result;
  }, [all]);

  const visible = tab === 'todas' ? all : all.filter((item) => item.kind === tab);

  // Agrupadas en Hoy / Ayer / Anteriores, como se ven en pantalla
  const sections = useMemo(() => {
    const groups = new Map();
    visible.forEach((item) => {
      const key = groupOf(item.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [visible]);

  const markRead = async (item) => {
    const next = new Set(readIds);
    next.add(item.id);
    setReadIds(next);
    await saveReadIds(user?.email, next);
  };

  const markAllRead = async () => {
    const next = new Set(all.map((item) => item.id));
    setReadIds(next);
    await saveReadIds(user?.email, next);
  };

  const open = (item) => {
    markRead(item);
    if (item.action?.route) navigation.navigate(item.action.route, item.action.params);
  };

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await savePrefs(user?.email, next);
  };

  return {
    tabs: NOTIF_TABS,
    tab,
    setTab,
    counts,
    sections,
    isRead: (item) => readIds.has(item.id),
    unreadCount,
    loading,
    reload: load,
    markRead,
    markAllRead,
    open,
    prefs,
    togglePref,
  };
}
