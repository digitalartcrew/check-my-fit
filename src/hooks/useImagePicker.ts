import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { resizeImage } from '@/utils/imageUtils';

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library access is needed to select an outfit photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const resized = await resizeImage(result.assets[0].uri);
      setImageUri(resized);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to photograph your outfit.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const resized = await resizeImage(result.assets[0].uri);
      setImageUri(resized);
    }
  }

  function clearImage() {
    setImageUri(null);
  }

  return { imageUri, pickFromLibrary, takePhoto, clearImage };
}
