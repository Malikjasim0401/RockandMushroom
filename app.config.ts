import type { ConfigContext, ExpoConfig } from 'expo/config';

// Native config can't import theme.ts (it pulls in react-native), so these mirror its tokens.
const BG_TOP = '#FAF6EF';
const PRIMARY = '#B5502F';

const CAMERA_USAGE =
  'RockAndMushroom uses your camera to photograph rocks, minerals and mushrooms so it can identify them.';
const PHOTOS_USAGE =
  'RockAndMushroom reads the photo you choose so it can identify the rock, mineral or mushroom in it.';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'RockAndMushroom',
  slug: 'rock-and-mushroom',
  scheme: 'rock-and-mushroom',
  platforms: ['ios', 'android'],
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  backgroundColor: BG_TOP,
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: 'co.raytechlab.rockandmushroom',
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'co.raytechlab.rockandmushroom',
    adaptiveIcon: {
      // Shown where launchers can't use the gradient layer; matches the icon's terracotta.
      backgroundColor: PRIMARY,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES'],
    // Added by default libraries but unused. SYSTEM_ALERT_WINDOW is only for dev overlays, and
    // nothing is written to shared storage. Fewer permissions means fewer store-review questions.
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
        backgroundColor: BG_TOP,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: CAMERA_USAGE,
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: PHOTOS_USAGE,
        cameraPermission: CAMERA_USAGE,
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
