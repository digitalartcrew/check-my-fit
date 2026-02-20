import React from 'react';
import { Image, ImageStyle, StyleSheet, View } from 'react-native';
import { COLORS } from '@/config/constants';

interface OutfitImageProps {
  uri: string;
  style?: ImageStyle;
}

export function OutfitImage({ uri, style }: OutfitImageProps) {
  return (
    <View style={[styles.container, style as any]}>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
