import type { DrawMethod } from '@/types';

export interface DraftPlayer {
  id: string;
  name: string;
  photoUrl?: string | null;
  overall: number; // 0-99, usado no método "por nota"
  isGoalkeeper: boolean;
  confirmedOrder?: number | null;
}

export interface DraftedTeam {
  players: DraftPlayer[];
  goalkeeper: DraftPlayer | null;
  totalOverall: number;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Sorteia os times a partir da lista de jogadores confirmados.
 *
 * - "arrival": os primeiros a confirmar presença formam o time 1, os seguintes o
 *   time 2, e assim por diante — quem sobra fica "de próximo" na fila de rodízio.
 * - "random": embaralha todo mundo e distribui em blocos.
 * - "rating": ordena por nota geral (desc) e distribui em zig-zag para equilibrar
 *   a soma de notas de cada time.
 *
 * Goleiros são distribuídos um por time antes dos jogadores de linha, sempre que houver.
 */
export function drawTeams(players: DraftPlayer[], teamSize: number, method: DrawMethod): DraftedTeam[] {
  if (players.length === 0) return [];
  const numTeams = Math.max(2, Math.ceil(players.length / teamSize));

  const goalkeepers = players.filter((p) => p.isGoalkeeper);
  const lines = players.filter((p) => !p.isGoalkeeper);

  const teams: DraftPlayer[][] = Array.from({ length: numTeams }, () => []);
  goalkeepers.forEach((gk, i) => {
    const teamIdx = i % numTeams;
    if (teams[teamIdx].length < teamSize) teams[teamIdx].push(gk);
  });

  const remainingCapacity = teams.map((t) => teamSize - t.length);
  let orderedLines: DraftPlayer[];
  if (method === 'random') {
    orderedLines = shuffle(lines);
  } else if (method === 'rating') {
    orderedLines = [...lines].sort((a, b) => b.overall - a.overall);
  } else {
    orderedLines = [...lines].sort((a, b) => (a.confirmedOrder ?? 0) - (b.confirmedOrder ?? 0));
  }

  const filledTeams = fillRespectingCapacity(
    teams,
    orderedLines,
    remainingCapacity,
    method === 'rating' ? 'rating' : 'chunk',
  );

  return filledTeams.map((teamPlayers) => ({
    players: teamPlayers,
    goalkeeper: teamPlayers.find((p) => p.isGoalkeeper) ?? null,
    totalOverall: teamPlayers.reduce((sum, p) => sum + p.overall, 0),
  }));
}

function fillRespectingCapacity(
  baseTeams: DraftPlayer[][],
  ordered: DraftPlayer[],
  capacity: number[],
  mode: 'chunk' | 'rating',
): DraftPlayer[][] {
  const teams = baseTeams.map((t) => [...t]);
  const cap = [...capacity];

  if (mode === 'chunk') {
    let teamIdx = 0;
    for (const player of ordered) {
      while (teamIdx < teams.length && cap[teamIdx] <= 0) teamIdx++;
      if (teamIdx >= teams.length) break;
      teams[teamIdx].push(player);
      cap[teamIdx]--;
      if (cap[teamIdx] <= 0) teamIdx++;
    }
    return teams;
  }

  // "rating": zig-zag respeitando capacidade restante de cada time
  let idx = 0;
  let direction = 1;
  for (const player of ordered) {
    let attempts = 0;
    while (cap[idx] <= 0 && attempts <= teams.length) {
      idx += direction;
      if (idx >= teams.length || idx < 0) {
        direction *= -1;
        idx += direction;
      }
      attempts++;
    }
    if (cap[idx] <= 0) break;
    teams[idx].push(player);
    cap[idx]--;
    idx += direction;
    if (idx >= teams.length || idx < 0) {
      direction *= -1;
      idx += direction;
    }
  }
  return teams;
}

export type MatchResult = 'teamA' | 'teamB' | 'draw';

/**
 * Fila de rodízio: index 0 e 1 jogam, os demais ficam "de próximo".
 * Regra padrão de pelada: quem ganha fica esperando o próximo desafiante, quem
 * perde vai para o fim da fila. Em empate, os dois times saem e os dois
 * próximos da fila entram.
 */
export function advanceQueue(queue: string[], result: MatchResult): string[] {
  if (queue.length < 2) return queue;
  const [teamA, teamB, ...waiting] = queue;
  if (queue.length < 3) return queue; // ninguém esperando, os dois times continuam se enfrentando

  if (result === 'draw') {
    return [...waiting, teamA, teamB];
  }
  const winner = result === 'teamA' ? teamA : teamB;
  const loser = result === 'teamA' ? teamB : teamA;
  return [winner, ...waiting, loser];
}
