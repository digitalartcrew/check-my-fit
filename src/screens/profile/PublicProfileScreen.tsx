import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';
import type { Outfit } from '@/types/outfit.types';

type Props = NativeStackScreenProps<MainStackParamList, 'PublicProfile'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - SPACING.sm) / 3;

export function PublicProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { profile, outfits, loading } = useUserProfile(userId);

  if (loading || !profile) {
    return (
      <ScreenWrapper>
        <View style={styles.profileHeader}>
          <Skeleton width={80} height={80} borderRadius={40} />
          <Skeleton width={150} height={20} style={{ marginTop: SPACING.sm }} />
        </View>
      </ScreenWrapper>
    );
  }

  function renderOutfit({ item }: { item: Outfit }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('OutfitDetail', { outfitId: item.id })}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.gridItem}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={outfits}
        renderItem={renderOutfit}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Avatar
              uri={profile.avatarUrl}
              name={profile.displayName}
              size={80}
            />
            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            {profile.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : null}

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profile.stats.outfitCount}</Text>
                <Text style={styles.statLabel}>Fits</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {profile.stats.averageRatingReceived > 0
                    ? profile.stats.averageRatingReceived.toFixed(1)
                    : '--'}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {profile.stats.totalRatingsReceived}
                </Text>
                <Text style={styles.statLabel}>Ratings</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shirt-outline"
            title="No fits yet"
            subtitle="This user hasn't posted any outfits."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  displayName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  username: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: COLORS.surfaceElevated,
    margin: 0.5,
  },
});
