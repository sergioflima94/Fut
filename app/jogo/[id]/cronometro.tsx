import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { advanceQueue, type MatchResult } from '@/lib/teamDraft';
import { useAppStore } from '@/store/useAppStore';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function CronometroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentPlayerId = useAppStore((s) => s.currentPlayerId);
  const game = useAppStore((s) => s.games.find((g) => g.id === id));
  const teams = useAppStore(useShallow((s) => s.teams.filter((t) => t.gameId === id)));
  const teamPlayers = useAppStore((s) => s.teamPlayers);
  const players = useAppStore((s) => s.players);
  const queue = useAppStore((s) => (id ? s.matchQueue[id] : undefined));
  const setMatchQueue = useAppStore((s) => s.setMatchQueue);
  const isAdmin = useAppStore((s) => (game ? s.isAdmin(currentPlayerId, game.peladaId) : false));

  const matchSeconds = (game?.matchMinutes ?? 10) * 60;
  const [remaining, setRemaining] = useState(matchSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            Vibration.vibrate([0, 400, 200, 400]);
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  if (!game) {
    return (
      <Screen>
        <Text style={styles.text}>Jogo não encontrado.</Text>
      </Screen>
    );
  }

  if (!queue || queue.length < 2) {
    return (
      <Screen>
        <Text style={styles.text}>Sorteie os times antes de iniciar o cronômetro.</Text>
      </Screen>
    );
  }

  const teamOf = (teamId: string) => teams.find((t) => t.id === teamId);
  const rosterOf = (teamId: string) => teamPlayers.filter((tp) => tp.teamId === teamId);
  const playerName = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? '—';
  const playerPhoto = (playerId: string) => players.find((p) => p.id === playerId)?.avatarUrl ?? null;

  const [teamAId, teamBId, ...waitingIds] = queue;
  const teamA = teamOf(teamAId);
  const teamB = teamOf(teamBId);

  function handleResult(result: MatchResult) {
    if (!id || !queue) return;
    const nextQueue = advanceQueue(queue, result);
    setMatchQueue(id, nextQueue);
    setRemaining(matchSeconds);
    setRunning(false);
  }

  const progress = 1 - remaining / matchSeconds;

  return (
    <Screen>
      <Card style={styles.timerCard}>
        <Text style={styles.timerLabel}>Tempo da rodada</Text>
        <Text style={styles.timer}>{formatTime(remaining)}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
        {isAdmin && (
          <View style={styles.timerControls}>
            <Button
              label={running ? 'Pausar' : 'Iniciar'}
              onPress={() => setRunning((r) => !r)}
              variant={running ? 'secondary' : 'primary'}
              small
            />
            <Button
              label="Zerar"
              variant="outline"
              small
              onPress={() => {
                setRunning(false);
                setRemaining(matchSeconds);
              }}
            />
          </View>
        )}
      </Card>

      <View style={styles.matchup}>
        <TeamBox
          name={teamA?.name}
          color={teamA?.color}
          roster={rosterOf(teamAId)}
          playerName={playerName}
          playerPhoto={playerPhoto}
        />
        <Text style={styles.vs}>x</Text>
        <TeamBox
          name={teamB?.name}
          color={teamB?.color}
          roster={rosterOf(teamBId)}
          playerName={playerName}
          playerPhoto={playerPhoto}
        />
      </View>

      {isAdmin && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Resultado da rodada</Text>
          <View style={styles.resultRow}>
            <Button label={`${teamA?.name ?? 'Time A'} venceu`} small onPress={() => handleResult('teamA')} />
            <Button label={`${teamB?.name ?? 'Time B'} venceu`} small onPress={() => handleResult('teamB')} />
          </View>
          <Button label="Empate" small variant="secondary" onPress={() => handleResult('draw')} />
        </Card>
      )}

      {waitingIds.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos de fora</Text>
          {waitingIds.map((tId) => {
            const t = teamOf(tId);
            return (
              <View key={tId} style={styles.waitingRow}>
                <View style={[styles.dot, { backgroundColor: t?.color }]} />
                <Text style={styles.waitingName}>{t?.name}</Text>
                <Text style={styles.waitingCount}>{rosterOf(tId).length} jogadores</Text>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

function TeamBox({
  name,
  color,
  roster,
  playerName,
  playerPhoto,
}: {
  name?: string;
  color?: string;
  roster: { playerId: string; isGoalkeeper: boolean }[];
  playerName: (id: string) => string;
  playerPhoto: (id: string) => string | null;
}) {
  return (
    <View style={styles.teamBox}>
      <Badge label={name ?? '—'} color={color ?? colors.primary} />
      {roster.map((r) => (
        <View key={r.playerId} style={styles.teamBoxPlayerRow}>
          <Avatar name={playerName(r.playerId)} photoUrl={playerPhoto(r.playerId)} size={22} />
          <Text style={styles.teamBoxPlayer}>
            {r.isGoalkeeper ? '🧤 ' : ''}
            {playerName(r.playerId)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  timerCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timer: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timerControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  teamBox: {
    flex: 1,
    gap: 4,
  },
  teamBoxPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  teamBoxPlayer: {
    color: colors.textMuted,
    fontSize: 12,
  },
  vs: {
    color: colors.textFaint,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  waitingName: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  waitingCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
