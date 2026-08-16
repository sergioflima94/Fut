import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { PlayerCard } from '@/components/PlayerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { formatGameDateShort } from '@/lib/format';
import { pickProfilePhoto } from '@/lib/photo';
import { punishmentLabel } from '@/lib/punishment';
import { computePlayerOverall, getPendingRatingGames } from '@/lib/ratings';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function PerfilScreen() {
  const currentPlayerId = useAppStore((s) => s.currentPlayerId);
  const player = useAppStore((s) => s.players.find((p) => p.id === currentPlayerId)!);
  const ratings = useAppStore((s) => s.ratings);
  const games = useAppStore((s) => s.games);
  const attendances = useAppStore((s) => s.attendances);
  const punishments = useAppStore(useShallow((s) => s.punishments.filter((p) => p.playerId === currentPlayerId)));
  const setPlayerPhoto = useAppStore((s) => s.setPlayerPhoto);
  const logout = useAuthStore((s) => s.logout);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const overall = computePlayerOverall(currentPlayerId, ratings);
  const pendingGames = getPendingRatingGames(games, attendances, ratings, currentPlayerId);

  async function handleChangePhoto() {
    setPickingPhoto(true);
    const uri = await pickProfilePhoto();
    if (uri) setPlayerPhoto(currentPlayerId, uri);
    setPickingPhoto(false);
  }

  return (
    <Screen>
      <Pressable style={styles.cardCenter} onPress={handleChangePhoto} disabled={pickingPhoto}>
        <PlayerCard name={player.name} nickname={player.nickname} photoUrl={player.avatarUrl} position={player.preferredPosition} overall={overall} width={190} />
        <View style={styles.changePhotoRow}>
          {pickingPhoto ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="camera" size={14} color={colors.primary} />
          )}
          <Text style={styles.changePhotoText}>{pickingPhoto ? 'Abrindo galeria...' : 'Alterar foto'}</Text>
        </View>
      </Pressable>

      <Text style={styles.name}>{player.name}</Text>
      {player.nickname && <Text style={styles.nickname}>"{player.nickname}"</Text>}

      {pendingGames.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações pendentes</Text>
          {pendingGames.map((g) => (
            <View key={g.id} style={styles.pendingRow}>
              <Text style={styles.pendingText}>Jogo de {formatGameDateShort(g.scheduledAt)}</Text>
              <Button label="Avaliar" small onPress={() => router.push(`/jogo/${g.id}/avaliar`)} />
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Punições</Text>
        {punishments.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma punição registrada. Continue assim!</Text>
        ) : (
          punishments.map((p) => (
            <View key={p.id} style={styles.punishmentRow}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.punishmentText}>{punishmentLabel(p.type)}</Text>
                {p.suspendedUntilGameCount > 0 && (
                  <Text style={styles.punishmentSub}>Suspenso por {p.suspendedUntilGameCount} jogo(s)</Text>
                )}
              </View>
              <Badge label={`Nível ${p.strikeLevel}`} color={colors.warning} />
            </View>
          ))
        )}
      </Card>

      <Button label="Sair" variant="outline" onPress={logout} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardCenter: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  changePhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
  nickname: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xs,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingText: {
    color: colors.text,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  punishmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  punishmentText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  punishmentSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
