import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { BannerAd, BannerAdSize, getBannerAdUnitId, isAdsSupported } from '@/lib/ads';

const HOUSE_ADS = [
  { title: 'Chuteira nova em promoção', subtitle: 'Até 30% off na loja parceira da pelada' },
  { title: 'Alugue quadras perto de você', subtitle: 'Compare preços de arenas na sua região' },
  { title: 'Camisa personalizada do time', subtitle: 'Peça a camisa da sua pelada com nome e número' },
];

/**
 * Banner de anúncio exibido apenas para jogadores não-Premium.
 * Em build nativo (EAS Build/dev client) usa o SDK real do AdMob
 * (ver src/lib/ads.ts, IDs configuráveis em .env). No web, que o AdMob
 * não suporta, cai num "house ad" local — ver src/lib/ads.web.ts.
 */
export function AdBanner() {
  const houseAd = useMemo(() => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)], []);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Anúncio</Text>
        <Pressable onPress={() => router.push('/(tabs)/perfil')}>
          <Text style={styles.removeAds}>Premium ou pague um jogo p/ remover</Text>
        </Pressable>
      </View>

      {isAdsSupported ? (
        <BannerAd unitId={getBannerAdUnitId()} size={BannerAdSize.BANNER} />
      ) : (
        <View style={styles.adBody}>
          <Ionicons name="megaphone-outline" size={20} color={colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{houseAd.title}</Text>
            <Text style={styles.subtitle}>{houseAd.subtitle}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeAds: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  adBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
});
