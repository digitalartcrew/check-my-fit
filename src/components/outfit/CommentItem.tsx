import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import { formatRelativeTime } from '@/utils/formatters';
import type { Comment } from '@/types/outfit.types';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  onUsernamePress: (userId: string) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onUsernamePress,
}: CommentItemProps) {
  const isOwn = comment.userId === currentUserId;

  function confirmDelete() {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(comment.id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Avatar
        uri={comment.userAvatarUrl}
        name={comment.username}
        size={32}
        onPress={() => onUsernamePress(comment.userId)}
      />
      <View style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onUsernamePress(comment.userId)}>
            <Text style={styles.username}>{comment.username}</Text>
          </TouchableOpacity>
          <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
      {isOwn && (
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  username: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.xs,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: SPACING.xs,
    alignSelf: 'flex-start',
  },
});
