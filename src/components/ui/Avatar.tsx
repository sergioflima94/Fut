import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  color?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, photoUrl, size = 40, color = colors.primaryDark }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!photoUrl && !failed;

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: radius.full, backgroundColor: color }]}>
      {showPhoto ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius: radius.full }}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    color: colors.white,
    fontWeight: '700',
  },
});
