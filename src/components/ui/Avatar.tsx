import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 40, color = colors.primaryDark }: AvatarProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: radius.full, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: '700',
  },
});
