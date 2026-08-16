import { useShallow } from 'zustand/react/shallow';

import { isAdFree } from '@/lib/payments';
import { isPremiumActive } from '@/lib/premium';
import { useAppStore } from '@/store/useAppStore';

/** true quando o jogador atual não deve ver anúncios: é Premium ou já pagou o rateio de algum jogo. */
export function useIsAdFree(): boolean {
  return useAppStore(
    useShallow((s) => {
      const player = s.players.find((p) => p.id === s.currentPlayerId);
      if (!player) return false;
      return isAdFree(isPremiumActive(player), player.id, s.payments);
    }),
  );
}
