import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OutfitDetailScreen } from '@/screens/feed/OutfitDetailScreen';
import { PublicProfileScreen } from '@/screens/profile/PublicProfileScreen';
import { AISuggestionScreen } from '@/screens/ai/AISuggestionScreen';
import { COLORS } from '@/config/constants';
import type { MainStackParamList } from '@/types/navigation.types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OutfitDetail"
        component={OutfitDetailScreen}
        options={{ title: 'Outfit' }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="AISuggestion"
        component={AISuggestionScreen}
        options={{ title: 'Style Suggestion' }}
      />
    </Stack.Navigator>
  );
}
