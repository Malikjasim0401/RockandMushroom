import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Notice, Text } from '@/components/ui';
import {
  Alternatives,
  ConfidenceBadge,
  isBestGuess,
  Meter,
} from '@/components/specimen/Confidence';
import { FunFact } from '@/components/specimen/FunFact';
import { KindBadge } from '@/components/specimen/KindBadge';
import { SafetyBanner } from '@/components/specimen/SafetyBanner';
import { TraitGrid } from '@/components/specimen/TraitGrid';
import { useSaveSighting } from '@/hooks/useSaveSighting';
import { type IdentifyResult, type Photo } from '@/lib/types';
import { enter, spacing } from '@/theme';

/** Long enough to read "Saved to finds" before moving on. */
const SAVED_PAUSE_MS = 650;

/** Result → Add to finds → Finds. Pops to the tabs, then selects the Finds tab. */
const goToFinds = () => {
  router.dismissAll();
  router.navigate('/journal');
};

type SpecimenResultProps = {
  result: IdentifyResult;
  photo: Photo;
  onRetake: () => void;
};

/** Result sheet content. Sections stagger in after the sheet springs up. */
export function SpecimenResult({ result, photo, onRetake }: SpecimenResultProps) {
  const bestGuess = isBestGuess(result.confidence);
  const { state, save } = useSaveSighting(result, photo);

  useEffect(() => {
    if (state.status !== 'saved') return;
    const timer = setTimeout(goToFinds, SAVED_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [state.status]);

  const saved = state.status === 'saved';

  return (
    <>
      <Animated.View entering={enter(1)} style={styles.heading}>
        <View style={styles.badges}>
          <KindBadge kind={result.kind} />
          <ConfidenceBadge confidence={result.confidence} />
        </View>
        <Text variant="title" accessibilityRole="header">
          {result.name}
        </Text>
        <Text variant="scientific">{result.scientificName}</Text>
        {!!result.family && <Text variant="caption">{result.family}</Text>}
        <View style={styles.meter}>
          <Meter value={result.confidence} />
        </View>
      </Animated.View>

      {/* Safety comes before the traits so nobody scrolls past it. */}
      <Animated.View entering={enter(2)}>
        <SafetyBanner
          kind={result.kind}
          edibility={result.edibility}
          warning={result.safetyWarning}
        />
      </Animated.View>

      <Animated.View entering={enter(3)}>
        <TraitGrid kind={result.kind} traits={result.traits} />
      </Animated.View>

      {!!result.summary && (
        <Animated.View entering={enter(4)}>
          <Text variant="body">{result.summary}</Text>
        </Animated.View>
      )}

      {!!result.funFact && (
        <Animated.View entering={enter(5)}>
          <FunFact text={result.funFact} />
        </Animated.View>
      )}

      {bestGuess && result.alternatives.length > 0 && (
        <Animated.View entering={enter(5)}>
          <Alternatives items={result.alternatives} />
        </Animated.View>
      )}

      <Animated.View entering={enter(6)} style={styles.actions}>
        {state.status === 'error' && <Notice message={state.message} />}
        <Button
          title={saved ? 'Saved to finds' : state.status === 'error' ? 'Try again' : 'Add to finds'}
          icon={saved ? 'check' : state.status === 'error' ? 'refresh' : 'bookmark'}
          onPress={save}
          loading={state.status === 'saving'}
          disabled={saved}
          accessibilityHint="Saves this specimen and its photo to your finds"
        />
        {!saved && (
          <Button
            title="Retake"
            icon="camera"
            variant="secondary"
            onPress={onRetake}
            disabled={state.status === 'saving'}
          />
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xxs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  meter: {
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
});
