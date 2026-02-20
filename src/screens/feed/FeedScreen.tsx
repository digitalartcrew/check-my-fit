import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { OutfitCard } from '@/components/outfit/OutfitCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOutfits } from '@/hooks/useOutfits';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';
import type { Outfit } from '@/types/outfit.types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const {
    outfits,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
  } = useOutfits();

  useEffect(() => {
    loadInitial();
  }, []);

  function renderItem({ item }: { item: Outfit }) {
    return (
      <OutfitCard
        outfit={item}
        onPress={() =>
          navigation.navigate('OutfitDetail', { outfitId: item.id })
        }
      />
    );
  }

  if (isInitialLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Check My Fit</Text>
        </View>
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={12} />
          ))}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Check My Fit</Text>
      </View>
      <FlatList
        data={outfits}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        onEndReached={() => hasMore && loadMore()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={styles.loadMore}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="shirt-outline"
            title="No outfits yet"
            subtitle="Be the first to post your fit!"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const CARD_WIDTH = (Dimensions.get('window').width - SPACING.md * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * (5 / 4);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadMore: {
    paddingVertical: SPACING.lg,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
  },
});
