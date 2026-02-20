import React, { memo } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { OutfitImage } from './OutfitImage';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { Outfit } from '@/types/outfit.types';

const CARD_WIDTH = (Dimensions.get('window').width - SPACING.md * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * (5 / 4);

interface OutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

export const OutfitCard = memo(function OutfitCard({
  outfit,
  onPress,
}: OutfitCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <OutfitImage
        uri={outfit.imageUrl}
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      />
      <View style={styles.footer}>
        <Avatar uri={outfit.userAvatarUrl} name={outfit.username} size={24} />
        <Text style={styles.username} numberOfLines={1}>
          {outfit.username}
        </Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={12} color={COLORS.star} />
          <Text style={styles.ratingText}>
            {outfit.averageRating > 0
              ? outfit.averageRating.toFixed(1)
              : '--'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  username: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
  },
});
