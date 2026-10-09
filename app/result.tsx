import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanOverlay } from '@/components/identify/ScanOverlay';
import { SpecimenResult } from '@/components/result/SpecimenResult';
import { LoadingCard } from '@/components/result/LoadingCard';
import { StatusMessage } from '@/components/result/StatusMessage';
import { Button, GradientBg, IconButton, Sheet, Toast } from '@/components/ui';
import { isWorking, useIdentify } from '@/hooks/useIdentify';
import { type Photo } from '@/lib/types';
import { colors, layout, motion, spacing, transitions } from '@/theme';

type Params = { uri?: string; width?: string; height?: string };

const retake = () => router.replace('/identify');
// Result replaces the Identify modal, so back normally lands on the tabs; fall back to Home.
const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function ResultScreen() {
  const { uri, width, height } = useLocalSearchParams<Params>();
  if (!uri) return <Redirect href="/" />;
  return <Result source={{ uri, width: Number(width) || 0, height: Number(height) || 0 }} />;
}

function Result({ source }: { source: Photo }) {
  const insets = useSafeAreaInsets();
  const { state, retry } = useIdentify(source);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Image
        source={{ uri: source.uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={motion.duration.base}
        accessibilityLabel="Your photo"
      />
      {isWorking(state) && <ScanOverlay />}
      <GradientBg variant="photoTop" style={[styles.topFade, { height: insets.top + 96 }]} />
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <IconButton icon="close" tone="dark" accessibilityLabel="Close" onPress={close} />
      </View>

      {isWorking(state) && <LoadingCard phase={state.status} />}

      {state.status === 'success' && (
        <Sheet key="success">
          <SpecimenResult result={state.result} photo={state.photo} onRetake={retake} />
        </Sheet>
      )}

      {state.status === 'noSpecimen' && (
        <Sheet key="noSpecimen">
          <StatusMessage
            icon="help"
            title="No specimen found"
            message="We couldn't spot a rock, mineral or mushroom in this photo. Try getting closer, in good light, with the specimen filling the frame."
            primary={{ title: 'Retake', icon: 'camera', onPress: retake }}
          />
        </Sheet>
      )}

      {state.status === 'limit' && (
        <Sheet key="limit">
          <StatusMessage
            icon="time"
            tone="sun"
            title="Daily limit reached"
            message={`${state.message} You can identify up to 50 photos a day.`}
            primary={{ title: 'Back to home', onPress: close }}
          />
        </Sheet>
      )}

      {state.status === 'error' && (
        <>
          {/* Brief: toast + Retry, keep the photo. */}
          <Toast message={state.message} icon="offline" />
          <Animated.View
            entering={transitions.sheetIn}
            exiting={transitions.fadeOut}
            style={[styles.errorBar, { paddingBottom: insets.bottom + spacing.lg }]}
          >
            <Button title="Try again" icon="refresh" onPress={retry} style={styles.grow} />
            <Button title="Retake" variant="secondary" onPress={retake} style={styles.grow} />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cameraBg,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPadding - spacing.xs,
  },
  errorBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  grow: {
    flex: 1,
  },
});
