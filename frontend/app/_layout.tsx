/**
 * Root layout with navigation and onboarding check
 */
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { onboardingCompleted } = useUserStore();

  useEffect(() => {
    // Check onboarding status and redirect
    if (!onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [onboardingCompleted]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0E1115' : '#F7F8FA',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="chat/index" />
    </Stack>
  );
}
