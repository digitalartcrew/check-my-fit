import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useUpload } from '@/hooks/useUpload';
import { useAuth } from '@/hooks/useAuth';
import { createOutfit } from '@/services/outfit.service';
import { COLORS, FONT_SIZES, LIMITS, SPACING } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const TAGS = ['Casual', 'Streetwear', 'Formal', 'Athleisure', 'Vintage', 'Minimalist'];

export function UploadScreen() {
  const navigation = useNavigation<Nav>();
  const { user, profile } = useAuth();
  const { imageUri, pickFromLibrary, takePhoto, clearImage } = useImagePicker();
  const { upload, progress, isUploading } = useUpload();
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handlePost() {
    if (!imageUri || !user || !profile) return;

    const result = await upload(user.uid, imageUri);
    if (!result) {
      Alert.alert('Upload Failed', 'Please try again.');
      return;
    }

    await createOutfit({
      userId: user.uid,
      username: profile.username,
      userAvatarUrl: profile.avatarUrl,
      imageUrl: result.imageUrl,
      storagePath: result.storagePath,
      caption: caption.trim(),
      tags: selectedTags,
    });

    clearImage();
    setCaption('');
    setSelectedTags([]);
    navigation.navigate('Tabs');
  }

  if (!imageUri) {
    return (
      <ScreenWrapper>
        <View style={styles.pickContainer}>
          <Ionicons name="shirt-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.pickTitle}>Share Your Fit</Text>
          <Text style={styles.pickSubtitle}>
            Take a photo or choose from your library to post your outfit
          </Text>
          <View style={styles.pickButtons}>
            <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
              <Text style={styles.pickBtnLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={32} color={COLORS.primary} />
              <Text style={styles.pickBtnLabel}>Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable>
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        <TouchableOpacity style={styles.changeBtn} onPress={clearImage}>
          <Ionicons name="close-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe your outfit..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={LIMITS.MAX_CAPTION_LENGTH}
        />
        <Text style={styles.charCount}>
          {caption.length}/{LIMITS.MAX_CAPTION_LENGTH}
        </Text>

        <Text style={styles.label}>Style Tags</Text>
        <View style={styles.tags}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.tagSelected,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
            <Text style={styles.progressText}>
              Uploading... {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        <Button
          label={isUploading ? 'Posting...' : 'Post Fit'}
          onPress={handlePost}
          loading={isUploading}
          fullWidth
          disabled={isUploading}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pickContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  pickTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  pickSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  pickButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.xl,
  },
  pickBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    width: 130,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickBtnLabel: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  changeBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  form: {
    padding: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  captionInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'right',
    marginTop: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  tagSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  tagTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
});
