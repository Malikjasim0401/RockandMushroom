import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SegmentedControl, type SegmentOption, Text } from '@/components/ui';
import { type Find } from '@/lib/types';
import { spacing, transitions } from '@/theme';

import { FunFact } from './FunFact';
import { filledTraits } from './kinds';
import { MohsScale } from './MohsScale';
import { TraitGrid } from './TraitGrid';

type Tab = 'overview' | 'features' | 'habitat';

/** Detail sections: Overview · Properties or Anatomy · Habitat. */
export function FindTabs({ find }: { find: Find }) {
  const [tab, setTab] = useState<Tab>('overview');

  const options = useMemo<SegmentOption<Tab>[]>(
    () => [
      { value: 'overview', label: 'Overview' },
      { value: 'features', label: find.kind === 'mushroom' ? 'Anatomy' : 'Properties' },
      { value: 'habitat', label: 'Habitat' },
    ],
    [find.kind],
  );

  const showMohs = find.kind !== 'mushroom';

  return (
    <View style={styles.root}>
      <SegmentedControl
        options={options}
        value={tab}
        onChange={setTab}
        accessibilityLabel="Find details"
      />
      {/* Keyed, so each tab fades in instead of swapping abruptly. */}
      <Animated.View key={tab} entering={transitions.fadeIn} style={styles.panel}>
        {tab === 'overview' && (
          <>
            {!!find.summary && <Text variant="body">{find.summary}</Text>}
            {showMohs && <MohsScale hardness={find.traits.hardness} />}
            <FunFact text={find.funFact} />
          </>
        )}
        {tab === 'features' && <TraitPanel find={find} group="features" />}
        {tab === 'habitat' && <TraitPanel find={find} group="habitat" />}
      </Animated.View>
    </View>
  );
}

function TraitPanel({ find, group }: { find: Find; group: 'features' | 'habitat' }) {
  if (filledTraits(find.kind, find.traits, group).length === 0) {
    return <Text variant="body">Nothing was recorded for this section.</Text>;
  }
  return <TraitGrid kind={find.kind} traits={find.traits} group={group} />;
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  panel: {
    gap: spacing.md,
  },
});
