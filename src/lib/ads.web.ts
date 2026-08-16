// AdMob (react-native-google-mobile-ads) não tem suporte a web — este stub
// evita que o módulo nativo seja incluído no bundle web. Ver ads.ts (nativo).

export const isAdsSupported = false;

export function initializeAds() {}

export function getBannerAdUnitId(): string {
  return '';
}

export function BannerAd(): null {
  return null;
}

export const BannerAdSize = {
  BANNER: 'BANNER',
  FULL_BANNER: 'FULL_BANNER',
} as const;
