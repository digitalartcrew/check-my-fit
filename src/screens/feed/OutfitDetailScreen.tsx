import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RatingBar } from '@/components/outfit/RatingBar';
import { CommentItem } from '@/components/outfit/CommentItem';
import { CommentInput } from '@/components/outfit/CommentInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOutfit } from '@/hooks/useOutfit';
import { useAuth } from '@/hooks/useAuth';
import { submitRating } from '@/services/rating.service';
import { addComment, deleteComment } from '@/services/comment.service';
import { deleteOutfit } from '@/services/outfit.service';
import { deleteStorageFile } from '@/services/storage.service';
import { formatRelativeTime, formatCount } from '@/utils/formatters';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<MainStackParamList, 'OutfitDetail'>;

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * (5 / 4);

export function OutfitDetailScreen({ route, navigation }: Props) {
  const { outfitId } = route.params;
  const { user, profile } = useAuth();
  const { outfit, comments, userRating, loading } = useOutfit(outfitId, user?.uid);
  const [optimisticRating, setOptimisticRating] = useState<number | null>(null);

  const currentRating = optimisticRating ?? userRating;
  const isOwner = outfit?.userId === user?.uid;

  async function handleRate(value: number) {
    if (!user) return;
    setOptimisticRating(value);
    try {
      await submitRating(outfitId, user.uid, value);
    } catch {
      setOptimisticRating(null);
      Alert.alert('Error', 'Failed to submit rating.');
    }
  }

  async function handleComment(text: string) {
    if (!user || !profile) return;
    await addComment(outfitId, {
      userId: user.uid,
      username: profile.username,
      userAvatarUrl: profile.avatarUrl,
      text,
    });
  }

  async function handleDeleteComment(commentId: string) {
    await deleteComment(outfitId, commentId);
  }

  async function handleDeleteOutfit() {
    if (!outfit) return;
    Alert.alert('Delete Outfit', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteOutfit(outfitId, outfit.userId);
          await deleteStorageFile(outfit.storagePath).catch(() => {});
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !outfit) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton width={width} height={IMAGE_HEIGHT} borderRadius={0} />
        <View style={styles.loadingInfo}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={120} height={16} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: outfit.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <View style={styles.ownerRow}>
            <Avatar
              uri={outfit.userAvatarUrl}
              name={outfit.username}
              size={40}
              onPress={() =>
                navigation.navigate('PublicProfile', { userId: outfit.userId })
              }
            />
            <View style={styles.ownerText}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('PublicProfile', { userId: outfit.userId })
                }
              >
                <Text style={styles.username}>{outfit.username}</Text>
              </TouchableOpacity>
              <Text style={styles.time}>{formatRelativeTime(outfit.createdAt)}</Text>
            </View>
            {isOwner && (
              <TouchableOpacity onPress={handleDeleteOutfit} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          {outfit.caption ? (
            <Text style={styles.caption}>{outfit.caption}</Text>
          ) : null}

          <View style={styles.ratingSection}>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingBig}>
                {outfit.averageRating > 0
                  ? outfit.averageRating.toFixed(1)
                  : '--'}
              </Text>
              <RatingBar value={outfit.averageRating} size={18} />
              <Text style={styles.ratingCount}>
                {formatCount(outfit.ratingCount)} rating
                {outfit.ratingCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {!isOwner && (
              <View style={styles.userRating}>
                <Text style={styles.rateLabel}>
                  {currentRating ? 'Your rating:' : 'Rate this fit:'}
                </Text>
                <RatingBar
                  value={currentRating ?? 0}
                  interactive
                  onRate={handleRate}
                  size={28}
                />
              </View>
            )}

            {isOwner && (
              <Button
                label="Get AI Style Suggestion"
                onPress={() =>
                  navigation.navigate('AISuggestion', { outfitId })
                }
                variant="secondary"
                fullWidth
                style={styles.aiBtn}
              />
            )}
          </View>

          <Text style={styles.sectionTitle}>
            {formatCount(outfit.commentCount)} Comment
            {outfit.commentCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.uid}
            onDelete={handleDeleteComment}
            onUsernamePress={(userId) =>
              navigation.navigate('PublicProfile', { userId })
            }
          />
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>

      <CommentInput onSubmit={handleComment} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingInfo: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  image: {
    width,
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.surfaceElevated,
  },
  info: {
    padding: SPACING.md,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  ownerText: {
    flex: 1,
  },
  username: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.xs,
  },
  deleteBtn: {
    padding: SPACING.sm,
  },
  caption: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  ratingSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingBig: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ratingCount: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  userRating: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  rateLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  aiBtn: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 0,
  },
  bottomPad: {
    height: SPACING.xl,
  },
});
