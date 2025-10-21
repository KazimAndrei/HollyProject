/**
 * Root layout with navigation and onboarding check
 */
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { onboardingCompleted } = useUserStore();

  useEffect(() => {
    // Check onboarding status and redirect (but not if already on onboarding)
    if (!onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [onboardingCompleted, pathname]);

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
      <Stack.Screen name="passage/[ref]" />
      <Stack.Screen
        name="subscription"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
