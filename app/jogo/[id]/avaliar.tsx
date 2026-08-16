import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StarRating } from '@/components/ui/StarRating';
import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

interface DraftScore {
  attack: number;
  defense: number;
  pace: number;
}

export default function AvaliarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentPlayerId = useAppStore((s) => s.currentPlayerId);
  const players = useAppStore((s) => s.players);
  const attendances = useAppStore(useShallow((s) => s.attendances.filter((a) => a.gameId === id)));
  const ratings = useAppStore(
    useShallow((s) => s.ratings.filter((r) => r.gameId === id && r.raterPlayerId === currentPlayerId)),
  );
  const submitRating = useAppStore((s) => s.submitRating);

  const toRate = attendances.filter(
    (a) => a.status === 'confirmed' && !a.noShow && a.playerId !== currentPlayerId,
  );

  const [scores, setScores] = useState<Record<string, DraftScore>>(() =>
    Object.fromEntries(
      toRate.map((a) => {
        const existing = ratings.find((r) => r.ratedPlayerId === a.playerId);
        return [a.playerId, { attack: existing?.attack ?? 3, defense: existing?.defense ?? 3, pace: existing?.pace ?? 3 }];
      }),
    ),
  );

  function updateScore(playerId: string, key: keyof DraftScore, value: number) {
    setScores((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [key]: value } }));
  }

  function handleSubmit() {
    if (!id) return;
    for (const playerId of Object.keys(scores)) {
      const s = scores[playerId];
      submitRating({ gameId: id, raterPlayerId: currentPlayerId, ratedPlayerId: playerId, ...s });
    }
    router.back();
  }

  if (toRate.length === 0) {
    return (
      <Screen>
        <Text style={styles.empty}>Não há jogadores para avaliar neste jogo.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.subtitle}>Dê uma nota de 1 a 5 em cada critério para quem jogou com você.</Text>
      {toRate.map((a) => {
        const player = players.find((p) => p.id === a.playerId)!;
        const s = scores[a.playerId];
        return (
          <Card key={a.playerId} style={styles.card}>
            <View style={styles.header}>
              <Avatar name={player.name} photoUrl={player.avatarUrl} size={36} />
              <Text style={styles.name}>{player.nickname || player.name}</Text>
            </View>
            <StarRating label="Ataque" value={s.attack} onChange={(v) => updateScore(a.playerId, 'attack', v)} />
            <StarRating label="Defesa" value={s.defense} onChange={(v) => updateScore(a.playerId, 'defense', v)} />
            <StarRating label="Velocidade" value={s.pace} onChange={(v) => updateScore(a.playerId, 'pace', v)} />
          </Card>
        );
      })}
      <Button label="Salvar avaliações" onPress={handleSubmit} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
