import { useShallow } from 'zustand/react/shallow';

import { useAppStore } from '@/store/useAppStore';
import type { Pelada } from '@/types';

/** A pelada (grupo) que está sendo exibida agora. Cai pra primeira cadastrada se currentPeladaId ainda não foi definido. */
export function useCurrentPelada(): Pelada {
  return useAppStore((s) => s.peladas.find((p) => p.id === s.currentPeladaId) ?? s.peladas[0]);
}

/** Peladas ativas das quais o jogador atual é membro. */
export function useMyPeladas(): Pelada[] {
  return useAppStore(
    useShallow((s) => {
      const myPeladaIds = new Set(
        s.memberships.filter((m) => m.playerId === s.currentPlayerId && m.active).map((m) => m.peladaId),
      );
      return s.peladas.filter((p) => myPeladaIds.has(p.id));
    }),
  );
}
