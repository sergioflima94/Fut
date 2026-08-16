import type { Player } from '@/types';

export const PREMIUM_PERIOD_DAYS = 30;

/** Premium é uma assinatura mensal: só vale enquanto premiumUntil não passou. Sem renovar, o benefício cai sozinho. */
export function isPremiumActive(player: Pick<Player, 'premiumUntil'>): boolean {
  return !!player.premiumUntil && new Date(player.premiumUntil).getTime() > Date.now();
}

export function daysUntilExpiry(premiumUntil: string | null): number {
  if (!premiumUntil) return 0;
  const diffMs = new Date(premiumUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

export function addPremiumPeriod(fromIso?: string): string {
  const base = fromIso ? new Date(fromIso) : new Date();
  base.setDate(base.getDate() + PREMIUM_PERIOD_DAYS);
  return base.toISOString();
}
