import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { HankenGrotesk_400Regular } from '@expo-google-fonts/hanken-grotesk/400Regular';
import { HankenGrotesk_400Regular_Italic } from '@expo-google-fonts/hanken-grotesk/400Regular_Italic';
import { HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk/600SemiBold';
import { HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';

import { AnimatedSplash } from '@/components/brand/AnimatedSplash';
import { iconFont } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { colors, fonts, motion } from '@/theme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 250, fade: true });

// Native splash fade (above) + a short brand beat before the in-app splash fades away.
const SPLASH_HOLD_MS = 450;

// Keys must match the family names in theme.ts `fonts`.
const fontMap = {
  [fonts.display]: Fraunces_600SemiBold,
  [fonts.regular]: HankenGrotesk_400Regular,
  [fonts.semibold]: HankenGrotesk_600SemiBold,
  [fonts.bold]: HankenGrotesk_700Bold,
  [fonts.italic]: HankenGrotesk_400Regular_Italic,
  ...iconFont,
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const auth = useAuth();
  // iOS already softens native transitions under Reduce Motion; Android needs it set explicitly.
  const reduceMotion = useReducedMotion();

  const fontsReady = fontsLoaded || !!fontError;
  // Hold the splash until the persisted session is restored, so the wrong screen never flashes.
  const ready = fontsReady && auth.status !== 'loading';
  const signedIn = auth.status === 'signedIn';
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    if (fontError) console.error('Font loading failed', fontError);
  }, [fontError]);

  useEffect(() => {
    if (!ready) return;
    // The in-app splash sits under the native one and looks identical, so the hand-off is
    // invisible; it then fades out over the first screen.
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setSplashVisible(false), SPLASH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgTop },
          animation: reduceMotion ? 'fade' : 'default',
          animationDuration: motion.duration.slow,
        }}
      >
        {/* Guards swap the available screens; Expo Router redirects when a guard flips. */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="identify"
            options={{
              presentation: 'fullScreenModal',
              animation: reduceMotion ? 'fade' : 'slide_from_bottom',
            }}
          />
          {/* Fades in over the camera, so the photo seems to freeze in place. */}
          <Stack.Screen name="result" options={{ animation: 'fade' }} />
          <Stack.Screen name="specimen/[id]" />
          <Stack.Screen name="delete-account" options={{ presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
      {splashVisible && <AnimatedSplash />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
