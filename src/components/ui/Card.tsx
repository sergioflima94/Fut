import { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
});
