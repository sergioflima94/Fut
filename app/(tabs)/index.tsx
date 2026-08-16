import { StyleSheet, Text, View } from 'react-native';

import { GameCard } from '@/components/GameCard';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function AgendaScreen() {
  const pelada = useAppStore((s) => s.peladas[0]);
  const games = useAppStore((s) => s.games);

  const now = Date.now();
  const upcoming = games
    .filter((g) => new Date(g.scheduledAt).getTime() >= now && g.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = games
    .filter((g) => new Date(g.scheduledAt).getTime() < now || g.status === 'finished')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <Screen>
      <Text style={styles.peladaName}>{pelada.name}</Text>
      <Text style={styles.sectionTitle}>Próximos jogos</Text>
      {upcoming.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum jogo agendado. Peça para um admin criar um na aba Admin.</Text>
        </View>
      ) : (
        upcoming.map((game) => <GameCard key={game.id} game={game} />)
      )}

      {past.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Jogos anteriores</Text>
          {past.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  peladaName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  empty: {
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
