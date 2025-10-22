/**
 * In-App Purchase service using expo-in-app-purchases
 * Singleton pattern with one-time initialization
 */
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

// Get backend URL
const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Product IDs
export const PRODUCT_IDS = {
  WEEKLY_PREMIUM: 'com.yourorg.biblechat.premium.weekly', // Weekly + 7-day trial
};

interface SubscriptionState {
  status: 'free' | 'trial' | 'active' | 'expired';
  needsServerValidation: boolean;
  trialEndsAt?: string;
  originalTransactionId?: string;
}

class IAPService {
  private isInitialized = false;
  private purchaseListener: InAppPurchases.Subscription | null = null;
  private onPurchaseUpdate: ((state: SubscriptionState) => void) | null = null;

  /**
   * Initialize IAP connection (singleton - called once)
   */
  async connect(): Promise<void> {
    if (this.isInitialized) {
      console.log('[IAP] Already initialized');
      return;
    }

    try {
      await InAppPurchases.connectAsync();
      this.isInitialized = true;
      console.log('[Analytics] iap_init', { platform: Platform.OS });
      console.log('✅ [IAP] Connected successfully');
    } catch (error) {
      console.error('❌ [IAP] Failed to connect:', error);
      throw new Error('Failed to initialize purchases');
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.purchaseListener) {
      this.purchaseListener.remove();
      this.purchaseListener = null;
    }

    try {
      await InAppPurchases.disconnectAsync();
      this.isInitialized = false;
      console.log('✅ [IAP] Disconnected');
    } catch (error) {
      console.error('❌ [IAP] Disconnect error:', error);
    }
  }

  /**
   * Get products from store
   */
  async getProducts(productIds: string[]): Promise<InAppPurchases.IAPItemDetails[]> {
    if (!this.isInitialized) {
      await this.connect();
    }

    try {
      const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        console.log('[Analytics] iap_products_loaded', { count: results?.length || 0 });
        console.log('✅ [IAP] Products loaded:', results);
        return results || [];
      } else {
        console.error('❌ [IAP] Failed to fetch products:', responseCode);
        return [];
      }
    } catch (error) {
      console.error('❌ [IAP] Get products error:', error);
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.connect();
    }

    try {
      console.log('[Analytics] iap_purchase_start', { productId });
      await InAppPurchases.purchaseItemAsync(productId);
      // Result will come through purchase listener
    } catch (error: any) {
      console.error('❌ [IAP] Purchase error:', error);
      console.log('[Analytics] iap_purchase_fail', { error: error?.message });
      throw error;
    }
  }

  /**
   * Verify subscription with backend server
   * @param transactionId - Transaction ID from purchase/restore
   * @param cachedOriginalTransactionId - Cached original transaction ID if available
   */
  async verifyWithServer(
    transactionId: string,
    cachedOriginalTransactionId?: string
  ): Promise<SubscriptionState> {
    try {
      console.log('[Analytics] verify_subscription_start', { transactionId });

      const response = await axios.post(`${BACKEND_URL}/api/subscription/verify`, {
        platform: 'ios',
        transactionId,
        originalTransactionId: cachedOriginalTransactionId,
      });

      const data = response.data;
      console.log('[Analytics] verify_subscription_success', {
        status: data.status,
        originalTransactionId: data.originalTransactionId,
      });

      return {
        status: data.status === 'active' ? 'active' : data.status === 'trial' ? 'trial' : 'expired',
        needsServerValidation: false,
        trialEndsAt: data.trialEndsAt,
        originalTransactionId: data.originalTransactionId,
      };
    } catch (error) {
      console.error('❌ [IAP] Server verification failed:', error);
      console.log('[Analytics] verify_subscription_fail', { error });

      // Return temporary state pending server validation
      return {
        status: 'active',
        needsServerValidation: true,
        originalTransactionId: cachedOriginalTransactionId,
      };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(cachedOriginalTransactionId?: string): Promise<SubscriptionState> {
    if (!this.isInitialized) {
      await this.connect();
    }

    try {
      console.log('[Analytics] iap_restore_start');
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (results && results.length > 0) {
        // Find our product in purchase history
        const ourProduct = results.find(
          (p) => p.productId === PRODUCT_IDS.WEEKLY_PREMIUM
        );

        if (ourProduct) {
          console.log('[Analytics] iap_restore_success', { productId: ourProduct.productId });
          console.log('✅ [IAP] Restore found purchase:', ourProduct);

          // Verify with server
          const verifiedState = await this.verifyWithServer(
            ourProduct.transactionId,
            cachedOriginalTransactionId
          );

          return verifiedState;
        } else {
          console.log('[Analytics] iap_restore_empty', { reason: 'no_matching_product' });
          return { status: 'free', needsServerValidation: false };
        }
      } else {
        console.log('[Analytics] iap_restore_empty', { reason: 'no_purchases' });
        return { status: 'free', needsServerValidation: false };
      }
    } catch (error) {
      console.error('❌ [IAP] Restore error:', error);
      console.log('[Analytics] iap_restore_fail', { error });
      throw new Error('Failed to restore purchases');
    }
  }

  /**
   * Setup purchase update listener (call once)
   */
  setupPurchaseListener(callback: (state: SubscriptionState) => void): void {
    if (this.purchaseListener) {
      console.warn('[IAP] Purchase listener already set, removing old one');
      this.purchaseListener.remove();
    }

    this.onPurchaseUpdate = callback;

    this.purchaseListener = InAppPurchases.setPurchaseListener(
      ({ responseCode, results, errorCode }) => {
        console.log('[IAP] Purchase update:', { responseCode, errorCode, resultsCount: results?.length });

        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          if (results && results.length > 0) {
            const purchase = results[0];
            console.log('[Analytics] iap_purchase_success', {
              productId: purchase.productId,
              transactionId: purchase.transactionId,
            });

            const state: SubscriptionState = {
              status: 'active', // Assume active; server will validate
              needsServerValidation: true,
              originalTransactionId: purchase.transactionId,
              // Note: expo-in-app-purchases doesn't reliably provide trial end date
              // Phase 5 will get this from server validation
            };

            this.onPurchaseUpdate?.(state);
          }
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          console.log('[Analytics] iap_purchase_cancelled');
          // User cancelled - no state update needed
        } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
          console.log('[Analytics] iap_purchase_deferred');
          // Payment deferred (e.g., Ask to Buy) - wait for approval
        } else {
          console.log('[Analytics] iap_purchase_fail', { responseCode, errorCode });
          // Purchase failed - show error
        }
      }
    );

    console.log('✅ [IAP] Purchase listener registered');
  }

  /**
   * Remove purchase listener
   */
  removePurchaseListener(): void {
    if (this.purchaseListener) {
      this.purchaseListener.remove();
      this.purchaseListener = null;
      console.log('✅ [IAP] Purchase listener removed');
    }
  }

  /**
   * Check if IAP is available on platform
   */
  isAvailable(): boolean {
    // IAP only works on iOS/Android, not web
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

// Export singleton instance
export const iapService = new IAPService();
