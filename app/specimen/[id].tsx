import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfidenceBadge, Meter } from '@/components/specimen/Confidence';
import { FindTabs } from '@/components/specimen/FindTabs';
import { KindBadge } from '@/components/specimen/KindBadge';
import { NotesEditor } from '@/components/specimen/NotesEditor';
import { SafetyBanner } from '@/components/specimen/SafetyBanner';
import { SpecimenPhoto } from '@/components/specimen/SpecimenPhoto';
import { EmptyState, GradientBg, Icon, IconButton, Screen, Skeleton, Text } from '@/components/ui';
import { useFind } from '@/hooks/useJournal';
import { formatSeenLong } from '@/lib/format';
import { type Find } from '@/lib/types';
import { colors, enter, layout, radii, shadows, spacing } from '@/theme';

const HERO_BLUR = 40;
const FRAME_TOP_GAP = 56;

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function FindDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, find } = useFind(id);

  if (find) return <Detail find={find} />;

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.fallback}>
      <IconButton icon="back" accessibilityLabel="Back" onPress={back} />
      {status === 'loading' ? (
        <View style={styles.fallbackBody}>
          <Skeleton height={280} radius={radii.hero} />
          <Skeleton width="60%" height={26} />
          <Skeleton width="40%" height={16} />
        </View>
      ) : (
        <EmptyState
          icon="journal"
          title="Find not found"
          message="It may have been removed from your finds."
          action={{ title: 'Back', onPress: back }}
        />
      )}
    </Screen>
  );
}

function Detail({ find }: { find: Find }) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.round(windowHeight * 0.46);
  // The sharp photo sits in a frame over its own blurred copy, clear of the back button and sheet.
  const frameTop = insets.top + FRAME_TOP_GAP;
  const frame = Math.round(
    Math.min(windowWidth * 0.62, heroHeight - frameTop - radii.hero - spacing.md),
  );
  const reduceMotion = useReducedMotion();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Parallax: the photo drifts at 45% of scroll speed, and stretches on iOS overscroll.
  const heroStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.get();
    return {
      transform: [
        { translateY: y < 0 ? y / 2 : y * 0.45 },
        { scale: y < 0 ? 1 + -y / heroHeight : 1 },
      ],
    };
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.View style={[styles.hero, { height: heroHeight }, heroStyle]}>
        <SpecimenPhoto find={find} blurRadius={HERO_BLUR} style={StyleSheet.absoluteFill} />
        <View style={styles.heroScrim} />
        <View
          style={[
            styles.frame,
            { top: frameTop, left: (windowWidth - frame) / 2, width: frame, height: frame },
          ]}
        >
          <SpecimenPhoto find={find} style={StyleSheet.absoluteFill} />
        </View>
        <GradientBg variant="photoTop" style={[styles.topFade, { height: insets.top + 110 }]} />
      </Animated.View>

      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ paddingTop: heroHeight - radii.hero }}
        >
          <View
            style={[
              styles.sheet,
              // Fills the screen below the hero, so the photo never shows under short content.
              {
                minHeight: windowHeight - heroHeight + radii.hero,
                paddingBottom: insets.bottom + spacing.xxl,
              },
            ]}
          >
            <Animated.View entering={enter(0)} style={styles.heading}>
              <View style={styles.badges}>
                <KindBadge kind={find.kind} />
                <ConfidenceBadge confidence={find.confidence} />
              </View>
              <Text variant="title" accessibilityRole="header">
                {find.name}
              </Text>
              <Text variant="scientific">{find.scientificName}</Text>
              {!!find.family && <Text variant="caption">{find.family}</Text>}
              <View style={styles.meter}>
                <Meter value={find.confidence} />
              </View>
            </Animated.View>

            <Animated.View entering={enter(1)} style={styles.seen}>
              <Icon name="calendar" size={16} color="primary" />
              <Text variant="label" color="inkMuted" style={styles.seenText}>
                Found {formatSeenLong(find.seenAt)}
              </Text>
            </Animated.View>

            <Animated.View entering={enter(2)}>
              <SafetyBanner
                kind={find.kind}
                edibility={find.edibility}
                warning={find.safetyWarning}
              />
            </Animated.View>

            <Animated.View entering={enter(3)}>
              <FindTabs find={find} />
            </Animated.View>

            <Animated.View entering={enter(4)} style={styles.block}>
              <NotesEditor key={find.id} findId={find.id} notes={find.notes} />
            </Animated.View>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <IconButton icon="back" tone="dark" accessibilityLabel="Back" onPress={back} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  fill: {
    flex: 1,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cameraBg,
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  frame: {
    position: 'absolute',
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.glassEdge,
    overflow: 'hidden',
    boxShadow: shadows.raised,
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
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    paddingTop: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
  heading: {
    gap: spacing.xxs,
  },
  meter: {
    marginTop: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  seen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seenText: {
    flex: 1,
  },
  block: {
    gap: spacing.xs,
  },
  fallback: {
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  fallbackBody: {
    gap: spacing.sm,
  },
});
