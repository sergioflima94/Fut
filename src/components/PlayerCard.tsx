import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getCardStyle } from '@/constants/cardStyles';
import { colors, radius, spacing } from '@/constants/theme';
import { overallTier } from '@/lib/ratings';
import type { PlayerOverall } from '@/types';

interface PlayerCardProps {
  name: string;
  nickname?: string | null;
  photoUrl?: string | null;
  cardStyleId?: string | null;
  cardBackgroundUrl?: string | null;
  position: 'goalkeeper' | 'line';
  overall: PlayerOverall;
  width?: number;
}

export function PlayerCard({
  name,
  nickname,
  photoUrl,
  cardStyleId,
  cardBackgroundUrl,
  position,
  overall,
  width = 160,
}: PlayerCardProps) {
  const tier = overallTier(overall.overall);
  const customStyle = getCardStyle(cardStyleId ?? null);
  const [gradientTop, gradientBase] = customStyle.colors ?? [tier.color, colors.bgElevated];
  const borderColor = customStyle.colors ? customStyle.colors[0] : tier.color;
  const height = width * 1.35;
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = !!photoUrl && !photoFailed;
  const [bgFailed, setBgFailed] = useState(false);
  const showBackground = !!cardBackgroundUrl && !bgFailed;

  return (
    <View style={[styles.card, { width, height, borderColor }]}>
      {showBackground ? (
        <Image
          source={{ uri: cardBackgroundUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setBgFailed(true)}
        />
      ) : (
        <LinearGradient
          colors={[gradientTop, gradientBase]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {showBackground && (
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.header}>
        <Text style={styles.overall}>{overall.overall}</Text>
        <Text style={styles.position}>{position === 'goalkeeper' ? 'GOL' : 'LIN'}</Text>
      </View>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          {showPhoto ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatarPhoto}
              contentFit="cover"
              transition={150}
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <Text style={styles.avatarInitials}>
              {name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {nickname || name}
      </Text>
      <Text style={styles.tierLabel}>{tier.label}</Text>

      <View style={styles.statsRow}>
        <Stat label="ATA" value={overall.attack} />
        <Stat label="DEF" value={overall.defense} />
        <Stat label="VEL" value={overall.pace} />
      </View>
      <Text style={styles.ratingsCount}>
        {overall.ratingsCount === 0 ? 'sem avaliações' : `${overall.ratingsCount} avaliações`}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overall: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  position: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    opacity: 0.85,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  name: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  tierLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  ratingsCount: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: spacing.xs,
  },
});
