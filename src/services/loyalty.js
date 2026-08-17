import { apiFetch } from './api.js';

// Programa de lealtad real: hojas, historial, código de referido y recompensas
export const fetchMyLoyalty = () => apiFetch('/api/loyalty/mine');
export const claimBirthdayBonus = () => apiFetch('/api/loyalty/claim-birthday', { method: 'POST' });
export const fetchRewardsCatalog = () => apiFetch('/api/loyalty/rewards');
export const redeemReward = (rewardId) =>
  apiFetch('/api/loyalty/redeem', { method: 'POST', body: JSON.stringify({ rewardId }) });
