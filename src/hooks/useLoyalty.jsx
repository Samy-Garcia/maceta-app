import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { claimBirthdayBonus, fetchMyLoyalty, fetchRewardsCatalog, redeemReward } from '../services/loyalty.js';

// Puntos de lealtad reales ("hojas"): saldo, historial, código de referido,
// bono de cumpleaños y catálogo de recompensas — todo viene del backend.
export function useLoyalty() {
  const [loyalty, setLoyalty] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([fetchMyLoyalty(), fetchRewardsCatalog()])
      .then(([loyaltyData, rewardsData]) => {
        setLoyalty(loyaltyData);
        setRewards(rewardsData || []);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar tu programa de lealtad.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleClaimBirthday = async () => {
    setClaiming(true);
    try {
      const res = await claimBirthdayBonus();
      Alert.alert('¡Feliz cumpleaños!', res.message || 'Se agregaron tus hojas de regalo.');
      load();
    } catch (err) {
      Alert.alert('No se pudo reclamar', err.message || 'Intenta de nuevo más tarde.');
    } finally {
      setClaiming(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (reward.redeemed) return;
    if ((loyalty?.points || 0) < reward.cost) {
      Alert.alert('Hojas insuficientes', `Necesitas ${reward.cost} hojas para canjear "${reward.title}".`);
      return;
    }
    Alert.alert('Canjear recompensa', `¿Canjear "${reward.title}" por ${reward.cost} hojas?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Canjear',
        onPress: async () => {
          setRedeemingId(reward.id);
          try {
            const redemption = await redeemReward(reward.id);
            Alert.alert(
              '¡Canjeado!',
              redemption.code
                ? `Tu código es ${redemption.code}. Úsalo al confirmar tu pedido.`
                : 'Tu recompensa fue canjeada correctamente.'
            );
            load();
          } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo canjear la recompensa.');
          } finally {
            setRedeemingId(null);
          }
        },
      },
    ]);
  };

  return {
    loyalty,
    rewards,
    loading,
    error,
    retry: load,
    claiming,
    handleClaimBirthday,
    redeemingId,
    handleRedeem,
  };
}
