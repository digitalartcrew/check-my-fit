import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { signOut } from '@/services/auth.service';
import { uploadAvatarImage } from '@/services/storage.service';
import { updateUserProfile } from '@/services/auth.service';
import { useImagePicker } from '@/hooks/useImagePicker';
import { COLORS, FONT_SIZES, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';
import type { Outfit } from '@/types/outfit.types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - SPACING.sm) / 3;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { profile, outfits, loading } = useUserProfile(user?.uid ?? '');
  const { pickFromLibrary } = useImagePicker();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  async function handleAvatarChange() {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      // Inline pick without hook state
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const url = await uploadAvatarImage(user.uid, result.assets[0].uri);
        await updateUserProfile(user.uid, { avatarUrl: url });
      }
    } catch {
      Alert.alert('Error', 'Failed to update avatar.');
    } finally {
      setUploadingAvatar(false);
    }
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

  if (loading || !profile) {
    return (
      <ScreenWrapper>
        <View style={styles.profileHeader}>
          <Skeleton width={80} height={80} borderRadius={40} />
          <Skeleton width={150} height={20} style={{ marginTop: SPACING.sm }} />
          <Skeleton width={80} height={14} style={{ marginTop: SPACING.xs }} />
        </View>
      </ScreenWrapper>
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
          <View>
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrap}>
                <Avatar
                  uri={profile.avatarUrl}
                  name={profile.displayName}
                  size={80}
                  onPress={handleAvatarChange}
                />
                {uploadingAvatar && (
                  <View style={styles.avatarOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                )}
              </View>
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

              <Button
                label="Sign Out"
                onPress={handleSignOut}
                variant="ghost"
                style={styles.signOutBtn}
              />
            </View>
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>My Fits</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shirt-outline"
            title="No fits yet"
            subtitle="Tap the + button to post your first outfit"
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
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  signOutBtn: {
    marginTop: SPACING.md,
  },
  gridHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gridTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: COLORS.surfaceElevated,
    margin: 0.5,
  },
});
