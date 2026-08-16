import type { Game, Punishment, PunishmentType } from '@/types';

/** Janela em dias para considerar faltas anteriores no cálculo do nível de punição. */
export const NO_SHOW_WINDOW_DAYS = 60;

function isWithinWindow(dateIso: string, days: number): boolean {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

/**
 * Nível de falta (strike) considerando o histórico recente do jogador na pelada.
 * Conta as faltas dentro da janela + a falta atual que está sendo registrada.
 */
export function strikeLevelFor(playerId: string, history: Punishment[], type: PunishmentType): number {
  const recentNoShows = history.filter(
    (p) => p.playerId === playerId && p.type === 'no_show' && isWithinWindow(p.createdAt, NO_SHOW_WINDOW_DAYS),
  );
  // "late_cancel" (avisou em cima da hora) pesa menos que simplesmente não aparecer.
  const weight = type === 'no_show' ? 1 : 0.5;
  return Math.round(recentNoShows.length + weight);
}

/** Quantos próximos jogos o jogador fica impedido de confirmar presença. */
export function suspensionForStrike(strikeLevel: number): number {
  if (strikeLevel <= 1) return 0; // 1ª falta: só um aviso, sem suspensão
  if (strikeLevel === 2) return 1; // 2ª falta: fora do próximo jogo
  return 2; // 3ª falta em diante: fora dos 2 próximos jogos
}

export function buildPunishment(params: {
  peladaId: string;
  playerId: string;
  gameId: string;
  type: PunishmentType;
  history: Punishment[];
}): Omit<Punishment, 'id' | 'createdAt'> {
  const strikeLevel = strikeLevelFor(params.playerId, params.history, params.type);
  return {
    peladaId: params.peladaId,
    playerId: params.playerId,
    gameId: params.gameId,
    type: params.type,
    strikeLevel,
    suspendedUntilGameCount: suspensionForStrike(strikeLevel),
    notes: null,
  };
}

/**
 * Verifica se o jogador ainda está cumprindo suspensão para o jogo informado,
 * contando quantos jogos da pelada já ocorreram desde a punição mais recente.
 */
export function isPlayerSuspended(
  playerId: string,
  punishments: Punishment[],
  gamesOrderedByDate: Game[],
  targetGameId: string,
): boolean {
  const own = punishments.filter((p) => p.playerId === playerId);
  if (own.length === 0) return false;
  const latest = own.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
  if (latest.suspendedUntilGameCount <= 0) return false;

  const punishedGameIdx = gamesOrderedByDate.findIndex((g) => g.id === latest.gameId);
  const targetGameIdx = gamesOrderedByDate.findIndex((g) => g.id === targetGameId);
  if (punishedGameIdx === -1 || targetGameIdx === -1) return false;

  const gamesSince = targetGameIdx - punishedGameIdx;
  return gamesSince >= 0 && gamesSince <= latest.suspendedUntilGameCount;
}

export function punishmentLabel(type: PunishmentType): string {
  return type === 'no_show' ? 'Furou o jogo' : 'Cancelou em cima da hora';
}
