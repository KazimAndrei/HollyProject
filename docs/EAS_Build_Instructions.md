# EAS Build Instructions

## EAS Configuration Complete ✅

**Files Created/Updated:**
- ✅ `eas.json` - Build profiles (development + production)
- ✅ `app.config.ts` - App configuration with bundle ID
- ✅ `app.json` - Updated with bundle identifiers

**Bundle ID:** `com.yourorg.biblechat`  
**Version:** 1.0.0  
**Build Number:** 1

---

## Quick Start

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

Enter your Expo account credentials (or create free account at expo.dev)

### 3. Configure Project (First Time Only)

```bash
cd /app/frontend
eas build:configure
```

This will:
- Link project to your Expo account
- Generate `projectId` in app.json `extra.eas.projectId`
- No code changes needed

### 4. Build for iOS

#### Development Build (Internal Testing):
```bash
eas build -p ios --profile development
```

**Features:**
- Development client (can load from Metro bundler)
- Faster builds
- Internal distribution (TestFlight or direct install)
- Good for testing IAP with Sandbox

**Output:** `.ipa` file + install link

#### Production Build (App Store Submission):
```bash
eas build -p ios --profile production
```

**Features:**
- Optimized for App Store
- Release configuration
- Requires Apple Developer account
- Submission-ready

**Output:** `.ipa` file ready for App Store Connect upload

---

## Build Profiles Explained

### Development Profile:
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": { "resourceClass": "m-medium" }
}
```

- `developmentClient: true` - Enables Expo development client features
- `distribution: "internal"` - For TestFlight or ad-hoc distribution
- `resourceClass: "m-medium"` - Medium build server (faster, sufficient for most apps)

### Production Profile:
```json
{
  "distribution": "store",
  "ios": { "resourceClass": "m-medium" }
}
```

- `distribution: "store"` - Optimized for App Store submission
- No development client - pure production build

---

## Prerequisites

### For Development Builds:
- ✅ Expo account (free)
- ✅ iOS device or simulator for testing

### For Production Builds:
- ✅ Apple Developer account ($99/year)
- ✅ App Store Connect access
- ✅ Bundle ID registered: `com.yourorg.biblechat`
- ✅ App Store product configured: `com.yourorg.biblechat.premium.weekly`

---

## Build Process

### Expected Build Time:
- **Development:** 10-15 minutes
- **Production:** 15-20 minutes

### Build Steps (Automated by EAS):
1. Upload source code to EAS servers
2. Install dependencies (yarn install)
3. Run Expo prebuild (generate native projects)
4. Build iOS app with Xcode
5. Sign with certificates (managed by EAS)
6. Generate .ipa file
7. Provide download link

### After Build Completes:

**Development Build:**
```bash
# Install on device via QR code or link
# Or download .ipa and install via Xcode/TestFlight
```

**Production Build:**
```bash
# Submit to App Store
eas submit -p ios --latest

# Or download .ipa and upload manually to App Store Connect
```

---

## Testing IAP with Development Build

### Why Development Build is Needed:
- ❌ Expo Go doesn't fully support `expo-in-app-purchases`
- ✅ Development build includes native IAP modules
- ✅ Can test Sandbox purchases end-to-end

### Steps:
1. Build development profile:
   ```bash
   eas build -p ios --profile development
   ```

2. Install on physical iOS device

3. Configure Sandbox tester in device:
   - Settings → App Store → Sandbox Account
   - Sign in with Sandbox tester credentials

4. Launch app and test purchase flow

5. Expected logs (visible in Metro bundler):
   ```
   [Analytics] iap_init {platform: 'ios'}
   [Analytics] iap_products_loaded {count: 1}
   [Analytics] iap_purchase_start
   [Analytics] iap_purchase_success
   [Analytics] verify_subscription_success {status: 'trial'}
   ```

---

## Environment Variables for Production

Before production build, ensure backend has:

```bash
# App Store Server API (Production)
APPSTORE_ENV=production
APPSTORE_ISSUER_ID=<real-issuer-id>
APPSTORE_KEY_ID=<real-key-id>
APPSTORE_PRIVATE_KEY=<base64-of-real-p8-file>
BUNDLE_ID=com.yourorg.biblechat
PRODUCT_ID=com.yourorg.biblechat.premium.weekly

# Backend URL (production)
EXPO_PUBLIC_BACKEND_URL=https://your-production-backend.com
```

---

## Troubleshooting

### Build Fails with "No bundle identifier"
**Fix:** Ensure `app.json` has `ios.bundleIdentifier` set

### Build Fails with "Invalid provisioning profile"
**Fix:** EAS manages certificates automatically. Run:
```bash
eas credentials -p ios
```

### "ExpoInAppPurchases native module not found"
**Fix:** This is expected in Expo Go. Use EAS development build.

### Build succeeds but app crashes on launch
**Check:**
- Backend URL is reachable from device
- All required native modules are included in build
- Review crash logs in Xcode Organizer

---

## Next Steps After Build

### Development Build:
1. Install on device
2. Test full user flow (onboarding → chat → subscription)
3. Test IAP with Sandbox account
4. Verify server-side verification working
5. Fix any bugs
6. Iterate

### Production Build:
1. Download `.ipa` from EAS
2. Upload to App Store Connect via Transporter or `eas submit`
3. Fill in App Store metadata
4. Add screenshots
5. Submit for review
6. Wait for Apple approval (typically 24-48 hours)

---

## Important Notes

- **NO DEPLOY YET** - These are build instructions only
- Development builds expire after 30 days (re-build as needed)
- Production builds do not expire
- EAS builds are cached - subsequent builds are faster
- Free Expo tier: Limited builds per month (check expo.dev pricing)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-22  
**Status:** ✅ Ready for EAS Build
