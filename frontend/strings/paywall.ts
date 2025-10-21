/**
 * Paywall localized strings
 */

export const paywallStrings = {
  en: {
    // Hero
    title: 'Step Into the Living Word!',
    subtitle: 'Find peace and strengthen your faith every day.',

    // Features
    features: [
      { icon: 'book', text: 'Daily Verse & Devotionals' },
      { icon: 'chatbubble', text: 'AI Chat with Bible citations' },
      { icon: 'calendar', text: 'Reading plans & streaks' },
      { icon: 'phone-portrait', text: 'Widgets', badge: 'Coming soon' },
    ],

    // CTA
    cta: 'Start 7-day free trial — then $8/week',
    ctaDisabled: 'Purchase integration coming soon',

    // Fine print
    finePrint:
      'Auto-renewing weekly subscription. Cancel anytime in Settings. Price may vary by region. Trial converts to paid unless canceled at least 24 hours before it ends.',

    // Footer
    restore: 'Restore Purchases',
    restoreNote: 'Available after purchase integration',
    manage: 'Manage Subscription',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
  },
  ru: {
    // Hero
    title: 'Шагните в живое Слово!',
    subtitle: 'Находите мир и укрепляйте веру каждый день.',

    // Features
    features: [
      { icon: 'book', text: 'Стих дня и девоционалы' },
      { icon: 'chatbubble', text: 'AI-чат с цитатами из Библии' },
      { icon: 'calendar', text: 'Планы чтения и серии' },
      { icon: 'phone-portrait', text: 'Виджеты', badge: 'Скоро' },
    ],

    // CTA
    cta: '7 дней бесплатно — затем $8/неделю',
    ctaDisabled: 'Интеграция покупок скоро',

    // Fine print
    finePrint:
      'Еженедельная автопродлеваемая подписка. Отменить можно в настройках. Цена может отличаться по регионам. После 7-дневного пробного периода подписка активируется автоматически, если не отменить за 24 часа до окончания.',

    // Footer
    restore: 'Восстановить покупки',
    restoreNote: 'Доступно после интеграции покупок',
    manage: 'Управление подпиской',
    terms: 'Условия использования',
    privacy: 'Политика конфиденциальности',
  },
};

/**
 * Get price display (for future StoreKit integration)
 */
export const getPriceDisplay = (locale: 'en' | 'ru', storePrice?: string): string => {
  // Use StoreKit price if available, otherwise fallback
  if (storePrice) {
    return storePrice;
  }
  return locale === 'en' ? '$8/week' : '$8/неделю';
};

/**
 * Get CTA text with price
 */
export const getCTAText = (locale: 'en' | 'ru', priceString?: string): string => {
  const price = getPriceDisplay(locale, priceString);
  
  if (locale === 'ru') {
    return `7 дней бесплатно — затем ${price}`;
  }
  return `Start 7-day free trial — then ${price}`;
};
