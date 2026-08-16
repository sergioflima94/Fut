import { Platform } from 'react-native';
import mobileAdsSdk, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export { BannerAd, BannerAdSize };

export const isAdsSupported = true;

export function initializeAds() {
  mobileAdsSdk().initialize();
}

export function getBannerAdUnitId(): string {
  const envId = Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID,
    default: undefined,
  });
  return envId || TestIds.BANNER;
}
