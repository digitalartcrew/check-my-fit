import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';

interface RatingBarProps {
  value: number;
  maxValue?: number;
  interactive?: boolean;
  onRate?: (value: number) => void;
  size?: number;
  showLabel?: boolean;
}

export function RatingBar({
  value,
  maxValue = 5,
  interactive = false,
  onRate,
  size = 24,
  showLabel = false,
}: RatingBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxValue }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(value);
        const iconName = filled ? 'star' : 'star-outline';

        if (interactive) {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onRate?.(starValue)}
              activeOpacity={0.7}
              style={styles.star}
            >
              <Ionicons name={iconName} size={size} color={COLORS.star} />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons
            key={i}
            name={iconName}
            size={size}
            color={COLORS.star}
            style={styles.star}
          />
        );
      })}
      {showLabel && value > 0 && (
        <Text style={[styles.label, { fontSize: size * 0.6 }]}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  label: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
});
