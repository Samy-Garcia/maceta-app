import { apiFetch } from './api.js';

// Programa de lealtad real: hojas, historial, código de referido y recompensas
export const fetchMyLoyalty = () => apiFetch('/api/loyalty/mine');
export const claimBirthdayBonus = () => apiFetch('/api/loyalty/claim-birthday', { method: 'POST' });
export const fetchRewardsCatalog = () => apiFetch('/api/loyalty/rewards');
// Mis canjes: los cupones/envíos ya canjeados traen el código para usar al pagar
export const fetchMyRedemptions = () => apiFetch('/api/loyalty/redemptions');
export const redeemReward = (rewardId) =>
  apiFetch('/api/loyalty/redeem', { method: 'POST', body: JSON.stringify({ rewardId }) });
