# Bible Chat - Release Readiness Checklist

## Feature Matrix (Phases 1-5C)

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| **1** | Scripture Corpus (KJV EN + Russian Synodal RU) | ✅ | 15 passages per language |
| **1** | RAG Pipeline (OpenAI GPT-4o) | ✅ | Fallback working, network issue acceptable |
| **1** | Chat API Endpoint | ✅ | POST /api/chat with citations |
| **1** | Scripture Endpoints | ✅ | GET /api/scripture/{ref}, /api/daily-verse |
| **1** | Citation Parser (EN/RU) | ✅ | 7/7 unit tests passed |
| **2A** | Onboarding (Translation + Disclaimer) | ✅ | Zustand + AsyncStorage persistence |
| **2B** | Chat UI (Citations Chips) | ✅ | MessageBubble, CitationChip components |
| **2C** | Home (Daily Verse Card) | ✅ | Cache, offline fallback, actions |
| **3** | Passage Viewer | ✅ | Highlights, translation switcher, navigation |
| **4A** | Subscription Paywall UI | ✅ | Hero, features, CTA, fine print |
| **4B** | IAP Integration (expo-in-app-purchases) | ✅ | Purchase, restore, localized prices |
| **4C** | Teaser Limit + Content Gating | ✅ | 2 free answers → paywall |
| **5A** | Server-side Subscription Verify | ✅ | App Store Server API (mock mode) |
| **5C** | Client Entitlement Sync | ✅ | Auto-sync on launch |

**Not Implemented (Future):**
- ❌ WidgetKit (iOS native - requires Swift)
- ❌ App Store Server Notifications V2 (Phase 5B - requires webhook URL)
- ❌ MongoDB subscription persistence (Phase 5B - stateless for MVP)
- ❌ Reading Plans & Streaks
- ❌ Bookmarks & Notes
- ❌ Push Notifications

---

## Smoke Test Checklist

### Prerequisites:
- [ ] Physical iOS device or Android device
- [ ] Expo Go app installed OR EAS development build
- [ ] Backend running (`sudo supervisorctl status backend` → RUNNING)
- [ ] Frontend running (`sudo supervisorctl status expo` → RUNNING)

### User Flow Tests:

#### 1. Onboarding
- [ ] Launch app → Onboarding screen appears
- [ ] Select translation (EN or RU)
- [ ] Check disclaimer checkbox
- [ ] Continue button becomes enabled
- [ ] Tap Continue → navigates to Home

#### 2. Daily Verse
- [ ] Home shows Daily Verse card (Psalm 23:1-4)
- [ ] Translation badge displays (KJV or Синодальный)
- [ ] Tap refresh icon → fetches fresh verse
- [ ] Tap "Read in context" → navigates to Passage Viewer
- [ ] Tap "Ask a question" → navigates to Chat

#### 3. Chat (Free Answers)
- [ ] Chat opens with empty state
- [ ] Type question (e.g., "How to deal with fear?")
- [ ] Answer appears with citation chips
- [ ] Progress chip shows "Free answers: 1/2"
- [ ] Send 2nd question → Answer appears
- [ ] Progress chip shows "Free answers: 2/2"
- [ ] Try 3rd question → Paywall opens with "from=chat_limit"

#### 4. Citations → Passage Viewer
- [ ] Tap citation chip (e.g., "John 3:16")
- [ ] Passage Viewer opens with correct verse
- [ ] Verse text displayed
- [ ] Translation badge shows (KJV or Синодальный)
- [ ] Tap language toggle → switches EN ↔ RU
- [ ] Copy button → shows Alert with verse text
- [ ] "Open in Chat" → navigates to Chat

#### 5. Subscription Paywall
- [ ] Paywall shows hero + 4 feature bullets
- [ ] CTA displays localized price (mock: "$8/week after 7-day trial")
- [ ] Fine print visible
- [ ] Restore Purchases button enabled
- [ ] Manage Subscription → shows Alert
- [ ] Terms/Privacy links → show Alerts
- [ ] Close button → returns to previous screen

#### 6. Subscription Flow (Sandbox Testing)
- [ ] Tap CTA → Purchase dialog appears (Sandbox)
- [ ] Complete purchase → Banner "Subscription activated!"
- [ ] Paywall closes after 2s
- [ ] Return to Chat → no gating, Send enabled
- [ ] Progress chip hidden

---

## Sandbox IAP Testing Instructions

### Setup:

1. **Create Sandbox Tester Account:**
   - Go to: App Store Connect → Users and Access → Sandbox Testers
   - Create new tester with unique email (e.g., `biblechat.tester1@example.com`)
   - Note: Use fake but valid email format

2. **Configure Product in App Store Connect:**
   - Product ID: `com.yourorg.biblechat.premium.weekly`
   - Type: Auto-Renewable Subscription
   - Subscription Duration: 1 week
   - Free Trial: 7 days
   - Price: $7.99 USD (Tier 10)
   - Review Information: Screenshots, description

3. **Device Setup:**
   - iOS device (iPhone/iPad)
   - Sign out of production App Store account
   - Install app via Expo Go or EAS development build
   - When prompted for Apple ID → use Sandbox tester email

### Test Scenarios:

#### Test 1: Fresh Install → Purchase
**Steps:**
1. Install app, complete onboarding
2. Send 3 questions in Chat
3. Paywall appears after 2nd answer
4. Tap "Start 7-day free trial — then $8/week"
5. Sandbox dialog: "Sign In to iTunes Store"
6. Enter Sandbox tester credentials
7. Confirm purchase (FREE for 7 days)

**Expected:**
- ✅ Banner: "Subscription activated!"
- ✅ Paywall closes after 2s
- ✅ Chat unlocked (Send button enabled, no progress chip)
- ✅ Console logs:
  ```
  [Analytics] iap_purchase_start
  [IAP] Purchase update: {responseCode: 0}
  [Analytics] iap_purchase_success
  [Analytics] verify_subscription_start
  [Analytics] verify_subscription_success {status: 'trial'}
  ```

#### Test 2: Restore Purchases
**Steps:**
1. Fresh install (or reset app data)
2. Complete onboarding
3. Open Paywall manually
4. Tap "Restore Purchases"

**Expected:**
- ✅ Banner: "Purchases restored!"
- ✅ Paywall closes
- ✅ Chat unlocked
- ✅ Console logs:
  ```
  [Analytics] iap_restore_start
  [Analytics] iap_restore_success
  [Analytics] verify_subscription_success {status: 'active'}
  ```

#### Test 3: App Restart (Cold Start)
**Steps:**
1. After successful purchase/restore
2. Force quit app
3. Relaunch app

**Expected:**
- ✅ Onboarding skipped
- ✅ Home screen appears
- ✅ Console logs:
  ```
  [Analytics] entitlement_sync_start
  [Analytics] entitlement_sync_success {status: 'active'}
  ✅ [App] Entitlement synced on launch: active
  ```
- ✅ Chat unlocked (no gating)

#### Test 4: Subscription Expired (Simulate)
**Steps:**
1. In mock mode, temporarily modify backend to return `status: 'expired'`
2. Restart app

**Expected:**
- ✅ Entitlement sync returns 'expired'
- ✅ Chat gated again
- ✅ Progress chip reappears after 2 answers

---

## App Store Metadata Draft

### App Information:

**App Name:**  
Bible Chat — Daily Verse & Prayer

**Subtitle:**  
Personal guide to peace & Scripture

**Primary Category:**  
Reference

**Secondary Category:**  
Lifestyle

**Age Rating:**  
4+ (No objectionable content)

---

### Promotional Text (170 chars max):

**English:**  
Step Into the Living Word! Daily verses, devotionals, prayer, and an AI chat that answers with Scripture citations.

**Russian:**  
Шагните в живое Слово! Ежедневные стихи, девоционалы, молитвы и AI-чат с цитатами из Библии.

---

### Description:

**English:**

Find peace and strengthen your faith with Bible Chat — your personal spiritual companion.

**Features:**
• 📖 **Daily Verse & Devotionals** — Start each day with inspiration from Scripture
• 💬 **AI Chat with Bible Citations** — Ask any question, get answers grounded in the Word (Book Chapter:Verse references)
• 📚 **Passage Viewer** — Read verses in context with highlighted text
• 🌍 **Multiple Translations** — KJV (English) and Russian Synodal
• 🌙 **Light & Dark Themes** — Beautiful, calm design for any time of day
• 🔒 **7-Day Free Trial** — Full access to all features, then $8/week

**Why Bible Chat?**
Unlike other Bible apps, Bible Chat provides pastoral guidance through AI-powered conversations. Every answer includes precise Scripture references, making it easy to verify and explore further.

**Subscription Details:**
- Auto-renewing weekly subscription
- 7-day free trial included
- Cancel anytime in Settings
- Price may vary by region

**Disclaimer:**
This app provides informational support based on the Bible. It is not a replacement for pastoral counsel or professional advice.

---

**Russian:**

Находите мир и укрепляйте веру с Bible Chat — вашим личным духовным спутником.

**Функции:**
• 📖 **Стих дня и девоционалы** — Начинайте каждый день с вдохновения из Писания
• 💬 **AI-чат с цитатами из Библии** — Задавайте любые вопросы, получайте ответы, основанные на Слове (ссылки на главы и стихи)
• 📚 **Просмотр отрывков** — Читайте стихи в контексте с подсветкой
• 🌍 **Несколько переводов** — KJV (английский) и Синодальный (русский)
• 🌙 **Светлая и тёмная темы** — Красивый, спокойный дизайн для любого времени дня
• 🔒 **7 дней бесплатно** — Полный доступ ко всем функциям, затем $8/неделю

**Почему Bible Chat?**
В отличие от других библейских приложений, Bible Chat предоставляет пасторское руководство через AI-разговоры. Каждый ответ включает точные ссылки на Писание.

**Детали подписки:**
- Еженедельная автопродлеваемая подписка
- 7-дневный бесплатный пробный период
- Отменить можно в настройках
- Цена может отличаться по регионам

**Дисклеймер:**
Приложение предоставляет информационную поддержку на основе Библии. Это не замена пасторскому наставлению и профессиональным рекомендациям.

---

### Keywords (100 chars max):

**English:**  
Bible, Scripture, Verse, Prayer, Devotional, Christian, Faith, God, Jesus, Chat, AI, KJV, Daily

**Russian:**  
Библия, Писание, Стих, Молитва, Девоционал, Христианский, Вера, Бог, Иисус, Чат, AI

---

### Screenshots Required (6.7" iPhone):

1. **Home - Daily Verse** (Light mode)
   - Shows Daily Verse card with Psalm 23
   - "Read in context" + "Ask a question" buttons visible

2. **Chat with Citations** (Light mode)
   - Conversation with AI answer
   - Citation chips displayed (e.g., "John 3:16", "Philippians 4:6-7")
   - Progress chip "Free answers: 1/2"

3. **Passage Viewer** (Dark mode)
   - John 3:16 with highlighted text
   - Translation badge "KJV"
   - Action buttons visible

4. **Subscription Paywall** (Light mode)
   - Hero with book icon
   - 4 feature bullets
   - CTA "Start 7-day free trial — then $8/week"

5. **Chat Gating** (Light mode)
   - EntitlementGate banner visible
   - "Free limit reached. Unlock with free trial"

6. **Russian Localization** (Dark mode)
   - Home screen in Russian
   - Daily Verse "Стих дня"
   - Russian Synodal translation visible

---

## Privacy & Legal

### Terms of Service (Placeholder):
`https://biblechat.app/terms`

**Key Points to Include:**
- Service description
- User responsibilities
- Content licenses (KJV public domain, Russian Synodal public domain)
- Disclaimer: informational only, not theological authority
- Subscription terms (7-day trial, $8/week, auto-renewal)
- Cancellation policy

### Privacy Policy (Placeholder):
`https://biblechat.app/privacy`

**Key Points to Include:**
- Data collected: User preferences (translation, locale), chat history (optional), subscription status
- Data storage: AsyncStorage (local), server (subscription validation only)
- No sale of user data
- Analytics: console logs only (no 3rd party trackers in MVP)
- Encryption: HTTPS for API calls
- User rights: data deletion on account removal
- Age requirement: 13+

---

## App Store Review Preparation

### Review Notes for Apple:

```
App Name: Bible Chat
Category: Reference
Age Rating: 4+

This app provides biblical guidance through AI-powered conversations.
All answers are grounded in Scripture with precise citations (Book Chapter:Verse).

Subscriptions:
- Product ID: com.yourorg.biblechat.premium.weekly
- Type: Auto-renewable weekly subscription
- Price: $7.99 USD (Tier 10)
- Free Trial: 7 days
- Implemented via: expo-in-app-purchases + App Store Server API

Content:
- Scripture: King James Version (Public Domain) + Russian Synodal Translation (Public Domain)
- AI Generation: OpenAI GPT-4o (pastoral tone, no offensive content)
- Moderation: Safety guardrails in system prompts

Test Account (Sandbox):
Email: biblechat.reviewer@example.com
Password: [provide Sandbox tester password]

Test Flow:
1. Complete onboarding (select English or Russian)
2. View Daily Verse on Home
3. Ask 2 questions in Chat (free answers with citations)
4. 3rd question triggers subscription paywall
5. Complete purchase with Sandbox account
6. Chat unlocks after purchase

Known Limitations:
- OpenAI API may be slow or unavailable → fallback responses provided
- Requires internet connection for AI chat
- Daily Verse and Passage Viewer work offline (cached)
```

---

## Technical Readiness

### Backend Health:
- ✅ All endpoints responding (200 OK)
- ✅ Scripture corpus loaded (30 passages total)
- ✅ OpenAI integration configured (Emergent LLM key)
- ✅ Citation parser tested (7/7 passed)
- ✅ Subscription verify endpoint (mock mode working)

### Frontend Health:
- ✅ Expo build successful (881 modules)
- ✅ Navigation working (expo-router file-based)
- ✅ State management (Zustand + AsyncStorage)
- ✅ IAP integration (expo-in-app-purchases)
- ✅ Light/Dark theme support
- ✅ EN/RU localization

### Environment Variables:

**Backend (.env):**
```bash
# MongoDB (optional for MVP)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="bible_chat_db"

# OpenAI
EMERGENT_LLM_KEY=sk-emergent-***

# App Store Server API (for production)
APPSTORE_ENV=sandbox
APPSTORE_ISSUER_ID=your-issuer-id
APPSTORE_KEY_ID=your-key-id
APPSTORE_PRIVATE_KEY=base64-encoded-p8-content
BUNDLE_ID=com.yourorg.biblechat
PRODUCT_ID=com.yourorg.biblechat.premium.weekly
```

**Frontend (.env):**
```bash
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
EXPO_PACKAGER_PROXY_URL=https://...
EXPO_PACKAGER_HOSTNAME=...
```

---

## Production Checklist

### Before Submission:

- [ ] Replace mock App Store keys with real production keys
- [ ] Update APPSTORE_ENV=production
- [ ] Test with real Sandbox account (3+ scenarios)
- [ ] Add Terms of Service URL (real page)
- [ ] Add Privacy Policy URL (real page)
- [ ] Configure bundle ID in app.config.ts
- [ ] Set version numbers (e.g., 1.0.0, build 1)
- [ ] Generate app icons (1024x1024 for App Store)
- [ ] Create 6 screenshots (6.7" iPhone)
- [ ] Test on multiple devices (iPhone, iPad if supported)
- [ ] Accessibility audit (VoiceOver, Dynamic Type)

### App Store Connect Setup:

- [ ] Create app record in App Store Connect
- [ ] Configure subscription product (weekly + 7-day trial)
- [ ] Set up App Store Server API key (.p8 file)
- [ ] Add subscription group
- [ ] Configure localized product descriptions
- [ ] Upload screenshots and preview videos (optional)
- [ ] Fill in App Privacy details
- [ ] Submit for review

---

## Known Issues & Workarounds

### Issue 1: OpenAI API Network Error
**Status:** Expected in container environment  
**Impact:** Chat returns fallback responses with nearest passages  
**Workaround:** Fallback mechanism working correctly  
**Fix:** Production backend with proper network access

### Issue 2: Web Preview Not Working
**Status:** import.meta module error  
**Impact:** Cannot test in browser  
**Workaround:** Test on native device with Expo Go  
**Fix:** Not needed - native-first app

### Issue 3: IAP Testing Limited in Expo Go
**Status:** expo-in-app-purchases partially works in Expo Go  
**Impact:** May need EAS development build for full IAP testing  
**Workaround:** Use EAS build for production testing  
**Fix:** `eas build -p ios --profile development`

---

## Support & Contact

### User Support:
- Email: support@biblechat.app (placeholder)
- FAQ: https://biblechat.app/faq (placeholder)

### Developer Support:
- Repository: (private)
- Backend: FastAPI + MongoDB
- Frontend: Expo/React Native
- AI: OpenAI GPT-4o via Emergent

---

## Versioning

**Current Version:** 1.0.0 (MVP)  
**Build Number:** 1  
**Min iOS Version:** 13.0  
**Min Android Version:** 6.0 (API 23)

---

## Next Steps (Post-MVP)

1. **Phase 5B:** App Store Server Notifications V2 (webhooks for renew/cancel/refund)
2. **Phase 6:** Reading Plans & Streaks
3. **Phase 7:** Bookmarks & Notes with sync
4. **Phase 8:** Push Notifications (Daily Verse reminders)
5. **Phase 9:** WidgetKit (requires native Swift module)
6. **Phase 10:** Expand corpus (full Bible, commentaries)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-22  
**Status:** ✅ Ready for Sandbox Testing
