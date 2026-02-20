import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthListener, useAuth } from '@/hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { LoadingOverlay } from '@/components/layout/LoadingOverlay';

export function RootNavigator() {
  useAuthListener();

  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
