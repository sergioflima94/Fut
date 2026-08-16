import type {
  Attendance,
  Field,
  Game,
  Pelada,
  PeladaMembership,
  Player,
  Punishment,
  Rating,
  Schedule,
  Team,
  TeamPlayer,
} from '@/types';

const now = new Date();
const iso = (d: Date) => d.toISOString();
const nextWeekday = (dayOfWeek: number, hour: number, minute: number) => {
  const d = new Date(now);
  const diff = (dayOfWeek - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', authUserId: 'auth-1', name: 'Você', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p2', authUserId: null, name: 'Bruno Silva', nickname: 'Brunão', avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p3', authUserId: null, name: 'Carlos Eduardo', nickname: 'Cadu', avatarUrl: null, phone: null, preferredPosition: 'goalkeeper', createdAt: iso(now) },
  { id: 'p4', authUserId: null, name: 'Diego Alves', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p5', authUserId: null, name: 'Eduardo Santos', nickname: 'Duda', avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p6', authUserId: null, name: 'Fábio Costa', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p7', authUserId: null, name: 'Gabriel Souza', nickname: 'Gabigol', avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p8', authUserId: null, name: 'Henrique Lima', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'goalkeeper', createdAt: iso(now) },
  { id: 'p9', authUserId: null, name: 'Igor Martins', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p10', authUserId: null, name: 'João Pedro', nickname: 'JP', avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p11', authUserId: null, name: 'Lucas Ferreira', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p12', authUserId: null, name: 'Marcelo Rocha', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p13', authUserId: null, name: 'Nathan Oliveira', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p14', authUserId: null, name: 'Otávio Ramos', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p15', authUserId: null, name: 'Paulo Vitor', nickname: 'PV', avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
  { id: 'p16', authUserId: null, name: 'Rafael Almeida', nickname: null, avatarUrl: null, phone: null, preferredPosition: 'line', createdAt: iso(now) },
];

export const CURRENT_PLAYER_ID = 'p1';

export const MOCK_PELADA: Pelada = {
  id: 'pel1',
  name: 'Pelada dos Amigos - Quintas',
  description: 'Society toda quinta às 20h',
  sport: 'society',
  defaultMaxPlayers: 16,
  defaultMatchMinutes: 10,
  createdBy: 'p1',
  createdAt: iso(now),
};

export const MOCK_MEMBERSHIPS: PeladaMembership[] = [
  { peladaId: 'pel1', playerId: 'p1', role: 'admin', active: true, joinedAt: iso(now) },
  { peladaId: 'pel1', playerId: 'p2', role: 'admin', active: true, joinedAt: iso(now) },
  ...MOCK_PLAYERS.slice(2).map((p) => ({ peladaId: 'pel1', playerId: p.id, role: 'member' as const, active: true, joinedAt: iso(now) })),
];

export const MOCK_FIELDS: Field[] = [
  { id: 'f1', peladaId: 'pel1', name: 'Arena Society Central', address: 'Rua das Palmeiras, 123', notes: 'Grama sintética, tem estacionamento', createdBy: 'p1' },
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    peladaId: 'pel1',
    fieldId: 'f1',
    recurrence: 'weekly',
    dayOfWeek: 4, // quinta-feira
    time: '20:00',
    startDate: iso(now).slice(0, 10),
    endDate: null,
    maxPlayers: 16,
    matchMinutes: 10,
    drawMethod: 'rating',
    active: true,
    createdBy: 'p1',
  },
];

const nextGameDate = nextWeekday(4, 20, 0);

export const MOCK_GAMES: Game[] = [
  {
    id: 'g1',
    peladaId: 'pel1',
    scheduleId: 's1',
    fieldId: 'f1',
    scheduledAt: iso(nextGameDate),
    maxPlayers: 16,
    playersPerTeam: 6,
    matchMinutes: 10,
    drawMethod: 'rating',
    status: 'open',
    createdBy: 'p1',
    createdAt: iso(now),
  },
];

// 15 confirmados como no exemplo do usuário: 14 amigos + você.
const confirmedIds = MOCK_PLAYERS.slice(0, 15).map((p) => p.id);

export const MOCK_ATTENDANCES: Attendance[] = MOCK_PLAYERS.map((p, idx) => {
  const isConfirmed = confirmedIds.includes(p.id);
  return {
    id: `att-${p.id}`,
    gameId: 'g1',
    playerId: p.id,
    status: isConfirmed ? 'confirmed' : 'pending',
    confirmedOrder: isConfirmed ? idx + 1 : null,
    respondedAt: isConfirmed ? iso(now) : null,
    noShow: false,
    checkedIn: false,
  } satisfies Attendance;
});

export const MOCK_TEAMS: Team[] = [];
export const MOCK_TEAM_PLAYERS: TeamPlayer[] = [];

export const MOCK_RATINGS: Rating[] = [
  { id: 'r1', gameId: 'g0', raterPlayerId: 'p2', ratedPlayerId: 'p1', attack: 4, defense: 3, pace: 5, overall: 4, createdAt: iso(now) },
  { id: 'r2', gameId: 'g0', raterPlayerId: 'p3', ratedPlayerId: 'p1', attack: 5, defense: 4, pace: 4, overall: 4.33, createdAt: iso(now) },
  { id: 'r3', gameId: 'g0', raterPlayerId: 'p4', ratedPlayerId: 'p1', attack: 3, defense: 3, pace: 4, overall: 3.33, createdAt: iso(now) },
  { id: 'r4', gameId: 'g0', raterPlayerId: 'p1', ratedPlayerId: 'p2', attack: 4, defense: 4, pace: 3, overall: 3.67, createdAt: iso(now) },
  { id: 'r5', gameId: 'g0', raterPlayerId: 'p3', ratedPlayerId: 'p8', attack: 2, defense: 5, pace: 3, overall: 3.33, createdAt: iso(now) },
];

export const MOCK_PUNISHMENTS: Punishment[] = [
  {
    id: 'pun1',
    peladaId: 'pel1',
    playerId: 'p9',
    gameId: 'g0',
    type: 'no_show',
    strikeLevel: 1,
    suspendedUntilGameCount: 0,
    notes: 'Confirmou e não avisou',
    createdAt: iso(now),
  },
];
