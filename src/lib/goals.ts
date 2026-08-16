import type { Goal, MatchTurn, TeamPlayer } from '@/types';

export interface PlayerGoalStats {
  scored: number;
  /** Saldo de gols: soma, em cada rodada que o time do jogador disputou, de (gols do time - gols sofridos). */
  balance: number;
}

export function computePlayerGoalStats(
  playerId: string,
  teamPlayers: TeamPlayer[],
  turns: MatchTurn[],
  goals: Goal[],
): PlayerGoalStats {
  const scored = goals.filter((g) => g.scorerPlayerId === playerId).length;

  const myTeamIds = new Set(teamPlayers.filter((tp) => tp.playerId === playerId).map((tp) => tp.teamId));
  let balance = 0;
  for (const turn of turns) {
    let myTeamId: string | null = null;
    let oppTeamId: string | null = null;
    if (myTeamIds.has(turn.teamAId)) {
      myTeamId = turn.teamAId;
      oppTeamId = turn.teamBId;
    } else if (myTeamIds.has(turn.teamBId)) {
      myTeamId = turn.teamBId;
      oppTeamId = turn.teamAId;
    }
    if (!myTeamId) continue;
    const myGoals = goals.filter((g) => g.matchTurnId === turn.id && g.teamId === myTeamId).length;
    const oppGoals = goals.filter((g) => g.matchTurnId === turn.id && g.teamId === oppTeamId).length;
    balance += myGoals - oppGoals;
  }

  return { scored, balance };
}

export function computeAllGoalStats(
  playerIds: string[],
  teamPlayers: TeamPlayer[],
  turns: MatchTurn[],
  goals: Goal[],
): Record<string, PlayerGoalStats> {
  return Object.fromEntries(playerIds.map((id) => [id, computePlayerGoalStats(id, teamPlayers, turns, goals)]));
}
