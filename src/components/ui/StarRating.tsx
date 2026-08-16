import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ label, value, onChange }: StarRatingProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            <Ionicons name={n <= value ? 'star' : 'star-outline'} size={22} color={colors.gold} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    width: 60,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
});
