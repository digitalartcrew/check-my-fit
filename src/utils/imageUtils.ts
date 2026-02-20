import * as ImageManipulator from 'expo-image-manipulator';

export async function resizeImage(uri: string, maxDimension = 1080): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxDimension } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
