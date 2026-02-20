import React, { useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Markdown from 'react-native-markdown-display';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { formatRelativeTime } from '@/utils/formatters';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<MainStackParamList, 'AISuggestion'>;

export function AISuggestionScreen({ route }: Props) {
  const { outfitId } = route.params;
  const { suggestion, isLoading, error, rateLimitMinutes, loadExistingSuggestion, generate } =
    useAISuggestion(outfitId);

  useEffect(() => {
    loadExistingSuggestion();
  }, []);

  async function handleGenerate() {
    if (rateLimitMinutes) {
      Alert.alert(
        'Rate Limit',
        `Please wait ${rateLimitMinutes} more minute${rateLimitMinutes !== 1 ? 's' : ''} before generating again.`
      );
      return;
    }
    await generate();
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingLabel}>
              Claude is analyzing your outfit ratings and comments...
            </Text>
            <Skeleton width="100%" height={20} style={styles.skeletonRow} />
            <Skeleton width="80%" height={20} style={styles.skeletonRow} />
            <Skeleton width="90%" height={20} style={styles.skeletonRow} />
            <Skeleton width="60%" height={20} style={styles.skeletonRow} />
            <Skeleton width="85%" height={20} style={styles.skeletonRow} />
            <Skeleton width="70%" height={20} style={styles.skeletonRow} />
          </View>
        ) : suggestion ? (
          <View style={styles.content}>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Generated {formatRelativeTime(suggestion.generatedAt)} ·{' '}
                {suggestion.ratingCountAtGeneration} rating
                {suggestion.ratingCountAtGeneration !== 1 ? 's' : ''} ·{' '}
                {suggestion.averageRatingAtGeneration.toFixed(1)}/5
              </Text>
            </View>
            <Markdown style={markdownStyles}>{suggestion.suggestion}</Markdown>
          </View>
        ) : (
          <EmptyState
            icon="sparkles-outline"
            title="No suggestion yet"
            subtitle="Generate a personalized style suggestion based on your community's ratings and comments."
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {error && !rateLimitMinutes && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {rateLimitMinutes && (
          <Text style={styles.rateLimitText}>
            Rate limit: wait {rateLimitMinutes} min before regenerating
          </Text>
        )}
        <Button
          label={
            isLoading
              ? 'Generating...'
              : suggestion
              ? 'Regenerate Suggestion'
              : 'Generate Suggestion'
          }
          onPress={handleGenerate}
          loading={isLoading}
          fullWidth
          disabled={isLoading || !!rateLimitMinutes}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  loading: {
    paddingTop: SPACING.lg,
  },
  loadingLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  skeletonRow: {
    marginBottom: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  metaRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metaText: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  rateLimitText: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
});

const markdownStyles = {
  body: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    backgroundColor: 'transparent',
  },
  heading1: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800' as const,
    marginBottom: SPACING.sm,
  },
  heading2: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700' as const,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  heading3: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    marginTop: SPACING.sm,
  },
  paragraph: {
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  bullet_list: {
    marginBottom: SPACING.sm,
  },
  list_item: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  strong: {
    color: COLORS.textPrimary,
    fontWeight: '700' as const,
  },
};
