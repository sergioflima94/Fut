import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  CURRENT_PLAYER_ID,
  MOCK_ATTENDANCES,
  MOCK_FIELDS,
  MOCK_GAMES,
  MOCK_MEMBERSHIPS,
  MOCK_PELADA,
  MOCK_PLAYERS,
  MOCK_PUNISHMENTS,
  MOCK_RATINGS,
  MOCK_SCHEDULES,
  MOCK_TEAMS,
  MOCK_TEAM_PLAYERS,
} from '@/lib/mockData';
import { buildPunishment } from '@/lib/punishment';
import type {
  Attendance,
  AttendanceStatus,
  DrawMethod,
  Field,
  Game,
  GameStatus,
  Pelada,
  PeladaMembership,
  Player,
  Punishment,
  PunishmentType,
  Rating,
  RecurrenceType,
  Schedule,
  Team,
  TeamPlayer,
} from '@/types';

const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

interface AppState {
  currentPlayerId: string;
  players: Player[];
  peladas: Pelada[];
  memberships: PeladaMembership[];
  fields: Field[];
  schedules: Schedule[];
  games: Game[];
  attendances: Attendance[];
  teams: Team[];
  teamPlayers: TeamPlayer[];
  ratings: Rating[];
  punishments: Punishment[];
  matchQueue: Record<string, string[]>; // gameId -> ordered team ids

  // chamada / presença
  setAttendance: (gameId: string, playerId: string, status: AttendanceStatus) => void;

  // sorteio de times
  setGameTeams: (gameId: string, teams: Team[], teamPlayers: TeamPlayer[]) => void;
  setGameStatus: (gameId: string, status: Game['status']) => void;
  setMatchQueue: (gameId: string, queue: string[]) => void;

  // avaliações
  submitRating: (rating: Omit<Rating, 'id' | 'createdAt' | 'overall'>) => void;

  // punições
  registerPunishment: (peladaId: string, playerId: string, gameId: string, type: PunishmentType) => void;

  // admin: campos, agenda, vagas
  addField: (peladaId: string, name: string, address: string, notes: string) => Field;
  addSchedule: (input: {
    peladaId: string;
    fieldId: string;
    recurrence: RecurrenceType;
    dayOfWeek: number | null;
    time: string;
    startDate: string;
    maxPlayers: number;
    matchMinutes: number;
    drawMethod: DrawMethod;
  }) => Schedule;
  addGameFromSchedule: (scheduleId: string, scheduledAt: string) => Game;
  updateGameMaxPlayers: (gameId: string, maxPlayers: number) => void;
  setDrawMethod: (gameId: string, method: DrawMethod) => void;
  promoteFromWaitlist: (gameId: string) => void;

  addAdmin: (peladaId: string, playerId: string) => void;
  removeAdmin: (peladaId: string, playerId: string) => void;

  isAdmin: (playerId: string, peladaId: string) => boolean;

  updateCurrentPlayerProfile: (input: { name: string; nickname: string | null; preferredPosition: Player['preferredPosition']; phone: string | null }) => void;
  setPlayerPhoto: (playerId: string, photoUrl: string) => void;
  setPlayerCardStyle: (playerId: string, cardStyleId: string | null) => void;
  updatePeladaInfo: (peladaId: string, input: { name: string; description: string | null }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPlayerId: CURRENT_PLAYER_ID,
      players: MOCK_PLAYERS,
      peladas: [MOCK_PELADA],
      memberships: MOCK_MEMBERSHIPS,
      fields: MOCK_FIELDS,
      schedules: MOCK_SCHEDULES,
      games: MOCK_GAMES,
      attendances: MOCK_ATTENDANCES,
      teams: MOCK_TEAMS,
      teamPlayers: MOCK_TEAM_PLAYERS,
      ratings: MOCK_RATINGS,
      punishments: MOCK_PUNISHMENTS,
      matchQueue: {},

      setAttendance: (gameId, playerId, status) => {
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return;
        set((state) => {
          const existing = state.attendances.find((a) => a.gameId === gameId && a.playerId === playerId);
          const confirmedCount = state.attendances.filter((a) => a.gameId === gameId && a.status === 'confirmed').length;
          let finalStatus = status;
          if (status === 'confirmed' && confirmedCount >= game.maxPlayers && existing?.status !== 'confirmed') {
            finalStatus = 'waitlist';
          }
          const nextOrder =
            finalStatus === 'confirmed'
              ? Math.max(0, ...state.attendances.filter((a) => a.gameId === gameId && a.confirmedOrder).map((a) => a.confirmedOrder ?? 0)) + 1
              : null;

          const attendances = existing
            ? state.attendances.map((a) =>
                a.gameId === gameId && a.playerId === playerId
                  ? { ...a, status: finalStatus, respondedAt: nowIso(), confirmedOrder: finalStatus === 'confirmed' ? a.confirmedOrder ?? nextOrder : null }
                  : a,
              )
            : [
                ...state.attendances,
                {
                  id: uid(),
                  gameId,
                  playerId,
                  status: finalStatus,
                  confirmedOrder: finalStatus === 'confirmed' ? nextOrder : null,
                  respondedAt: nowIso(),
                  noShow: false,
                  checkedIn: false,
                } satisfies Attendance,
              ];

          const confirmedNow = attendances.filter((a) => a.gameId === gameId && a.status === 'confirmed').length;
          const games = state.games.map((g): Game => {
            if (g.id !== gameId) return g;
            const nextStatus: GameStatus = confirmedNow >= g.maxPlayers ? 'full' : g.status === 'full' ? 'open' : g.status;
            return { ...g, status: nextStatus };
          });

          return { attendances, games };
        });
      },

      setGameTeams: (gameId, teams, teamPlayers) => {
        set((state) => ({
          teams: [...state.teams.filter((t) => t.gameId !== gameId), ...teams],
          teamPlayers: [
            ...state.teamPlayers.filter((tp) => !state.teams.some((t) => t.gameId === gameId && t.id === tp.teamId)),
            ...teamPlayers,
          ],
          games: state.games.map((g) => (g.id === gameId ? { ...g, status: 'teams_drawn' } : g)),
          matchQueue: { ...state.matchQueue, [gameId]: teams.map((t) => t.id) },
        }));
      },

      setGameStatus: (gameId, status) => {
        set((state) => ({ games: state.games.map((g) => (g.id === gameId ? { ...g, status } : g)) }));
      },

      setMatchQueue: (gameId, queue) => {
        set((state) => ({ matchQueue: { ...state.matchQueue, [gameId]: queue } }));
      },

      submitRating: (rating) => {
        const overall = Math.round(((rating.attack + rating.defense + rating.pace) / 3) * 100) / 100;
        set((state) => ({
          ratings: [
            ...state.ratings.filter(
              (r) => !(r.gameId === rating.gameId && r.raterPlayerId === rating.raterPlayerId && r.ratedPlayerId === rating.ratedPlayerId),
            ),
            { ...rating, id: uid(), overall, createdAt: nowIso() },
          ],
        }));
      },

      registerPunishment: (peladaId, playerId, gameId, type) => {
        set((state) => {
          const punishment = buildPunishment({ peladaId, playerId, gameId, type, history: state.punishments });
          return {
            punishments: [...state.punishments, { ...punishment, id: uid(), createdAt: nowIso() }],
            attendances: state.attendances.map((a) =>
              a.gameId === gameId && a.playerId === playerId ? { ...a, noShow: type === 'no_show' } : a,
            ),
          };
        });
      },

      addField: (peladaId, name, address, notes) => {
        const field: Field = { id: uid(), peladaId, name, address: address || null, notes: notes || null, createdBy: get().currentPlayerId };
        set((state) => ({ fields: [...state.fields, field] }));
        return field;
      },

      addSchedule: (input) => {
        const schedule: Schedule = {
          id: uid(),
          peladaId: input.peladaId,
          fieldId: input.fieldId,
          recurrence: input.recurrence,
          dayOfWeek: input.dayOfWeek,
          time: input.time,
          startDate: input.startDate,
          endDate: null,
          maxPlayers: input.maxPlayers,
          matchMinutes: input.matchMinutes,
          drawMethod: input.drawMethod,
          active: true,
          createdBy: get().currentPlayerId,
        };
        set((state) => ({ schedules: [...state.schedules, schedule] }));
        return schedule;
      },

      addGameFromSchedule: (scheduleId, scheduledAt) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        if (!schedule) throw new Error('Agenda não encontrada');
        const game: Game = {
          id: uid(),
          peladaId: schedule.peladaId,
          scheduleId: schedule.id,
          fieldId: schedule.fieldId,
          scheduledAt,
          maxPlayers: schedule.maxPlayers,
          playersPerTeam: 6,
          matchMinutes: schedule.matchMinutes,
          drawMethod: schedule.drawMethod,
          status: 'open',
          createdBy: get().currentPlayerId,
          createdAt: nowIso(),
        };
        set((state) => ({ games: [...state.games, game] }));
        return game;
      },

      updateGameMaxPlayers: (gameId, maxPlayers) => {
        set((state) => ({ games: state.games.map((g) => (g.id === gameId ? { ...g, maxPlayers } : g)) }));
      },

      setDrawMethod: (gameId, method) => {
        set((state) => ({ games: state.games.map((g) => (g.id === gameId ? { ...g, drawMethod: method } : g)) }));
      },

      promoteFromWaitlist: (gameId) => {
        set((state) => {
          const waitlisted = state.attendances
            .filter((a) => a.gameId === gameId && a.status === 'waitlist')
            .sort((a, b) => (a.confirmedOrder ?? 0) - (b.confirmedOrder ?? 0));
          if (waitlisted.length === 0) return {};
          const next = waitlisted[0];
          const maxOrder = Math.max(0, ...state.attendances.filter((a) => a.gameId === gameId && a.confirmedOrder).map((a) => a.confirmedOrder ?? 0));
          return {
            attendances: state.attendances.map((a) =>
              a.id === next.id ? { ...a, status: 'confirmed', confirmedOrder: maxOrder + 1 } : a,
            ),
          };
        });
      },

      addAdmin: (peladaId, playerId) => {
        set((state) => ({
          memberships: state.memberships.map((m) => (m.peladaId === peladaId && m.playerId === playerId ? { ...m, role: 'admin' } : m)),
        }));
      },

      removeAdmin: (peladaId, playerId) => {
        set((state) => ({
          memberships: state.memberships.map((m) => (m.peladaId === peladaId && m.playerId === playerId ? { ...m, role: 'member' } : m)),
        }));
      },

      isAdmin: (playerId, peladaId) => {
        return get().memberships.some((m) => m.peladaId === peladaId && m.playerId === playerId && m.role === 'admin' && m.active);
      },

      updateCurrentPlayerProfile: (input) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === state.currentPlayerId ? { ...p, ...input } : p)),
        }));
      },

      setPlayerPhoto: (playerId, photoUrl) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === playerId ? { ...p, avatarUrl: photoUrl } : p)),
        }));
      },

      setPlayerCardStyle: (playerId, cardStyleId) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === playerId ? { ...p, cardStyleId } : p)),
        }));
      },

      updatePeladaInfo: (peladaId, input) => {
        set((state) => ({
          peladas: state.peladas.map((p) => (p.id === peladaId ? { ...p, ...input } : p)),
        }));
      },
    }),
    {
      name: 'pelada-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        players: state.players,
        peladas: state.peladas,
        memberships: state.memberships,
        fields: state.fields,
        schedules: state.schedules,
        games: state.games,
        attendances: state.attendances,
        teams: state.teams,
        teamPlayers: state.teamPlayers,
        ratings: state.ratings,
        punishments: state.punishments,
        matchQueue: state.matchQueue,
        currentPlayerId: state.currentPlayerId,
      }),
    },
  ),
);
