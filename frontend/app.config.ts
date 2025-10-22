import { ExpoConfig, ConfigContext } from 'expo/config';

const config = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Bible Chat',
  slug: 'bible-chat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'biblechat',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.yourorg.biblechat',
    buildNumber: '1',
    supportsTablet: true,
    infoPlist: {
      LSApplicationQueriesSchemes: ['biblechat'],
    },
  },
  android: {
    package: 'com.yourorg.biblechat',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#000',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#000',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
    eas: {
      projectId: 'your-project-id-will-be-added-by-eas',
    },
  },
});

export default config;
