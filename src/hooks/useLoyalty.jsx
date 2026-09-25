import { useEffect, useMemo, useState } from 'react';
import {
  claimBirthdayBonus,
  fetchMyLoyalty,
  fetchMyRedemptions,
  fetchRewardsCatalog,
  redeemReward,
} from '../services/loyalty.js';
import { fetchOffers } from '../services/products.js';
import { hojasToUsd, LOYALTY_TIERS, resolveTier } from '../utils/loyaltyTiers.js';
import { useToast } from '../context/ToastContext.jsx';

// Puntos de lealtad reales ("hojas"): saldo, historial, código de referido,
// bono de cumpleaños y catálogo de recompensas — todo viene del backend.
export function useLoyalty() {
  const toast = useToast();
  const [loyalty, setLoyalty] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [offers, setOffers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    // Ofertas y canjes son opcionales: si fallan, la pantalla igual se muestra
    Promise.all([
      fetchMyLoyalty(),
      fetchRewardsCatalog(),
      fetchOffers().catch(() => []),
      fetchMyRedemptions().catch(() => []),
    ])
      .then(([loyaltyData, rewardsData, offersData, redemptionsData]) => {
        setLoyalty(loyaltyData);
        setRewards(rewardsData || []);
        setOffers((offersData || []).filter((offer) => offer.status));
        setRedemptions(redemptionsData || []);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar tu programa de lealtad.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Nivel, tabla de niveles y valor aproximado en USD: los calcula el backend.
  // resolveTier/hojasToUsd solo cubren el caso de que el servidor todavía no
  // esté desplegado con esos campos, para que la pantalla no se rompa.
  const points = loyalty?.points ?? 0;
  const tier = useMemo(() => loyalty?.tier ?? resolveTier(points), [loyalty?.tier, points]);
  const tiers = loyalty?.tiers ?? LOYALTY_TIERS;
  const usdValue = useMemo(
    () =>
      loyalty?.approxValueUsd != null
        ? Number(loyalty.approxValueUsd).toFixed(2)
        : hojasToUsd(points),
    [loyalty?.approxValueUsd, points]
  );

  const handleClaimBirthday = async () => {
    setClaiming(true);
    try {
      const res = await claimBirthdayBonus();
      toast.success('¡Feliz cumpleaños!', res.message || 'Se agregaron tus hojas de regalo.');
      load();
    } catch (err) {
      toast.error('No se pudo reclamar', err.message || 'Intenta de nuevo más tarde.');
    } finally {
      setClaiming(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (reward.redeemed) return;
    if ((loyalty?.points || 0) < reward.cost) {
      toast.warning('Hojas insuficientes', 'Necesitas ' + reward.cost + ' hojas para canjear "' + reward.title + '".');
      return;
    }
    const ok = await toast.confirm({
      title: 'Canjear recompensa',
      message: '¿Canjear "' + reward.title + '" por ' + reward.cost + ' hojas?',
      confirmLabel: 'Canjear',
      icon: 'gift-outline',
    });
    if (!ok) return;

    setRedeemingId(reward.id);
    try {
      const redemption = await redeemReward(reward.id);
      if (redemption.code) {
        await toast.alert({
          title: '¡Canjeado!',
          message: 'Tu código es ' + redemption.code + '. Úsalo al confirmar tu pedido.',
          icon: 'gift',
          confirmLabel: 'Entendido',
        });
      } else {
        toast.success('¡Canjeado!', 'Tu recompensa fue canjeada correctamente.');
      }
      load();
    } catch (err) {
      toast.error('No se pudo canjear', err.message || 'No se pudo canjear la recompensa.');
    } finally {
      setRedeemingId(null);
    }
  };

  return {
    loyalty,
    rewards,
    offers,
    redemptions,
    tier,
    tiers,
    usdValue,
    loading,
    error,
    retry: load,
    claiming,
    handleClaimBirthday,
    redeemingId,
    handleRedeem,
  };
}
