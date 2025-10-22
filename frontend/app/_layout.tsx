/**
 * Root layout with navigation and onboarding check
 */
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import { iapService } from '../services/iap';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { onboardingCompleted, getOriginalTransactionId, needsServerValidation, setSubscription } = useUserStore();
  const hasSyncedEntitlement = useRef(false);

  useEffect(() => {
    // Check onboarding status and redirect (but not if already on onboarding)
    if (!onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [onboardingCompleted, pathname]);

  useEffect(() => {
    // Sync entitlement on launch (once per session)
    if (hasSyncedEntitlement.current) return;

    const syncEntitlement = async () => {
      const originalTransactionId = getOriginalTransactionId();
      
      // Sync if we have a transaction ID or need validation
      if (originalTransactionId || needsServerValidation) {
        hasSyncedEntitlement.current = true;

        const state = await iapService.syncEntitlementOnLaunch(
          originalTransactionId,
          needsServerValidation
        );

        if (state) {
          setSubscription(state);
          console.log('✅ [App] Entitlement synced on launch:', state.status);
        }
      }
    };

    syncEntitlement();
  }, []);

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
