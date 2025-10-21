/**
 * Subscription Paywall screen (Phase 4B - IAP integrated)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/useUserStore';
import PaywallHero from '../components/PaywallHero';
import FeatureBullet from '../components/FeatureBullet';
import { paywallStrings, getCTAText } from '../strings/paywall';
import { iapService, PRODUCT_IDS } from '../services/iap';

export default function SubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { locale, setSubscription } = useUserStore();
  const strings = paywallStrings[locale];
  const from = params.from as string | undefined;

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState<string | undefined>(undefined);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Analytics: paywall_show
    console.log('[Analytics] paywall_show', { from: from || 'manual' });

    // Initialize IAP and fetch products
    initializeIAP();

    // Setup purchase listener
    iapService.setupPurchaseListener((state) => {
      console.log('[IAP] Purchase update received:', state);
      setSubscription(state);
      setIsPurchasing(false);

      if (state.status === 'active') {
        showBanner('success', locale === 'ru' ? 'Подписка активирована!' : 'Subscription activated!');
        // Close paywall after 2s
        setTimeout(() => router.back(), 2000);
      }
    });

    return () => {
      // Cleanup on unmount
      iapService.removePurchaseListener();
    };
  }, [from]);

  const initializeIAP = async () => {
    if (!iapService.isAvailable()) {
      console.warn('[IAP] Not available on this platform');
      setIsLoadingProducts(false);
      return;
    }

    try {
      await iapService.connect();
      const products = await iapService.getProducts([PRODUCT_IDS.WEEKLY_PREMIUM]);

      if (products.length > 0) {
        const product = products[0];
        // Use iOS priceString (e.g., "$8.99")
        setLocalizedPrice(product.priceString || undefined);
        console.log('[IAP] Product loaded:', { price: product.priceString });
      } else {
        console.warn('[IAP] No products found');
      }
    } catch (error) {
      console.error('[IAP] Init error:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleCTATap = async () => {
    if (isPurchasing || !iapService.isAvailable()) return;

    console.log('[Analytics] paywall_cta_tap');
    setIsPurchasing(true);

    try {
      await iapService.purchaseProduct(PRODUCT_IDS.WEEKLY_PREMIUM);
      // Result will come via listener
    } catch (error: any) {
      setIsPurchasing(false);

      if (error?.code === 'E_USER_CANCELLED') {
        console.log('[IAP] User cancelled purchase');
        // Don't show error for user cancellation
      } else {
        const errorMsg = locale === 'ru'
          ? 'Не удалось завершить покупку. Попробуйте снова.'
          : 'Purchase failed. Please try again.';
        showBanner('error', errorMsg);
      }
    }
  };

  const handleRestore = async () => {
    if (isRestoring || !iapService.isAvailable()) return;

    console.log('[Analytics] paywall_restore_tap');
    setIsRestoring(true);

    try {
      const state = await iapService.restorePurchases();

      if (state.status === 'active') {
        setSubscription(state);
        const successMsg = locale === 'ru'
          ? 'Покупки восстановлены!'
          : 'Purchases restored!';
        showBanner('success', successMsg);
        setTimeout(() => router.back(), 2000);
      } else {
        const emptyMsg = locale === 'ru'
          ? 'Покупки не найдены'
          : 'No purchases found';
        showBanner('error', emptyMsg);
      }
    } catch (error) {
      const errorMsg = locale === 'ru'
        ? 'Не удалось восстановить покупки'
        : 'Failed to restore purchases';
      showBanner('error', errorMsg);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManage = () => {
    console.log('[Analytics] paywall_manage_tap');
    Alert.alert(
      strings.manage,
      'Opens iOS Settings → Subscriptions (placeholder)',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    console.log('[Analytics] paywall_terms_tap');
    Alert.alert(
      strings.terms,
      'https://biblechat.app/terms (placeholder)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => console.log('Open Terms URL') },
      ]
    );
  };

  const handlePrivacy = () => {
    console.log('[Analytics] paywall_privacy_tap');
    Alert.alert(
      strings.privacy,
      'https://biblechat.app/privacy (placeholder)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => console.log('Open Privacy URL') },
      ]
    );
  };

  const ctaText = getCTAText(locale, localizedPrice);

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={['top']}
    >
      {/* Close button */}
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={28} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {/* Banner (success/error) */}
      {banner && (
        <View style={[styles.banner, banner.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
          <Ionicons
            name={banner.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={banner.type === 'success' ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.bannerText, banner.type === 'success' ? styles.bannerTextSuccess : styles.bannerTextError]}>
            {banner.message}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <PaywallHero title={strings.title} subtitle={strings.subtitle} />

        {/* Features */}
        <View style={styles.featuresSection}>
          {strings.features.map((feature, index) => (
            <FeatureBullet
              key={index}
              icon={feature.icon as any}
              text={feature.text}
              badge={feature.badge}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (isPurchasing || isLoadingProducts) && styles.ctaButtonDisabled,
          ]}
          onPress={handleCTATap}
          disabled={isPurchasing || isLoadingProducts}
          activeOpacity={0.8}
          testID="paywall-cta-button"
          accessible={true}
          accessibilityLabel={ctaText}
          accessibilityRole="button"
        >
          {isPurchasing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaButtonText}>{ctaText}</Text>
          )}
        </TouchableOpacity>

        {/* Loading note */}
        {isLoadingProducts && (
          <Text style={[styles.loadingNote, isDark ? styles.subtextDark : styles.subtextLight]}>
            {locale === 'ru' ? 'Загрузка цен...' : 'Loading prices...'}
          </Text>
        )}

        {/* Fine print */}
        <Text style={[styles.finePrint, isDark ? styles.subtextDark : styles.subtextLight]}>
          {strings.finePrint}
        </Text>

        {/* Footer links */}
        <View style={styles.footer}>
          {/* Restore */}
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleRestore}
            disabled={isRestoring}
            testID="paywall-restore-button"
            accessible={true}
            accessibilityLabel={strings.restore}
            accessibilityRole="button"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#4C7CF0" />
            ) : (
              <Text style={styles.footerButtonText}>
                {strings.restore}
              </Text>
            )}
          </TouchableOpacity>

          {/* Manage */}
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleManage}
            testID="paywall-manage-button"
            accessible={true}
            accessibilityLabel={strings.manage}
            accessibilityRole="button"
          >
            <Text style={styles.footerButtonText}>
              {strings.manage}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Privacy */}
        <View style={styles.legalLinks}>
          <TouchableOpacity
            onPress={handleTerms}
            testID="paywall-terms-button"
            accessible={true}
            accessibilityLabel={strings.terms}
          >
            <Text style={styles.legalLinkText}>{strings.terms}</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity
            onPress={handlePrivacy}
            testID="paywall-privacy-button"
            accessible={true}
            accessibilityLabel={strings.privacy}
          >
            <Text style={styles.legalLinkText}>{strings.privacy}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F7F8FA',
  },
  containerDark: {
    backgroundColor: '#0E1115',
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    padding: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  bannerSuccess: {
    backgroundColor: '#D1FAE5',
  },
  bannerError: {
    backgroundColor: '#FEE2E2',
  },
  bannerText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  bannerTextSuccess: {
    color: '#065F46',
  },
  bannerTextError: {
    color: '#991B1B',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  featuresSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#4C7CF0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingNote: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  finePrint: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#4C7CF0',
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalLinkText: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  subtextLight: {
    color: '#6B7280',
  },
  subtextDark: {
    color: '#9CA3AF',
  },
});
